import { useRef, useEffect, useState, useCallback, useContext } from "react";
import { debounce } from "../utils";
import { SpeechContext } from "../contexts/speechContext";
import Canvas from "../classes/Canvas";
import Particle from "../classes/Particle";
import Mouse from "../classes/Mouse";
import styled from "styled-components";

import { canvasFontSize } from "../constants/Data";
import font_ttf from "../assets/fonts/GowunBatang-Regular.ttf";

const PointerDiv = styled.div<{ $width: number; $height: number }>`
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0);
`;

type Props = {
  text: string[];
  afterAnimationFunc: () => void;
};

type PointerDiv = {
  width: number;
  height: number;
};

let particles: { [key: string]: Particle } | null = null; // 순서 x 객체 사용
export default function ScatterCanvas(props: Props) {
  const { text, afterAnimationFunc } = props;
  const speechService = useContext(SpeechContext);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [pointerDiv, setPointerDiv] = useState<PointerDiv | null>(null);
  const [mouse, setMouse] = useState<Mouse | null>(null);

  const createParticle = useCallback(
    (textInfo: PointerDiv, xPos: number, yPos: number) => {
      if (!canvas || !canvas.ctx) return;

      if (!particles) particles = {};
      const ctx = canvas.ctx;
      const dpr = canvas.dpr;
      const met = textInfo;
      const width = Math.floor(met.width * dpr);

      const imgData = ctx.getImageData(
        (xPos - (met.width / 2) )* dpr,
        yPos * dpr,
        met.width * dpr,
        met.height * dpr
      );

      canvas.clearCanvas();

      let count = 0;
      for (let i = 0; i < imgData.data.length; i += 4 * dpr) {
        count++;

        if (imgData.data[i + 3] > 125) {
          // 성능향상을 위해 절반의 파티클만 생성하기
          if (count % 2 === 0) continue;
          const x = (count % (width / dpr)) + (xPos - met.width / 2);
          const y = Math.floor(count / width) + yPos;
          const coordX = Math.floor(x);
          const coordY = Math.floor(y);

          particles[`${coordX}-${coordY}`] = new Particle(x - 1, y, imgData.data[i + 3] / 255, ctx);
          particles[`${coordX}-${coordY}`].draw();
        }
      }
    },
    [canvas]
  );

  const animation = useCallback(
    (sequence: string) => {
      const length = particles ? Object.keys(particles).length : 0;
      if (length === 0) {
        afterAnimationFunc();
        canvas?.cancelAnimation();
        particles = null;
      }

      if (particles) {
        for (const [key, value] of Object.entries(particles)) {
          switch (sequence) {
            case "first":
              value.draw();
              value.firstUpdate();
              break;
            case "second":
              if (!mouse) return;

              value.draw();
              value.update(mouse);
              break;
            case "third":
              value.draw();
              value.update_opacity();

              if (value.opacity <= 0 && particles) delete particles[key];
              break;
            default:
              canvas?.cancelAnimation();
              break;
          }
        }
      }
    },
    [mouse, afterAnimationFunc, canvas]
  );

  const onMouseDownPointerDiv = useCallback(
    (div: PointerDiv) => {
      if (!canvas) return;

      const x = canvas.CANVAS_WIDTH / 2;
      const y = (canvas.CANVAS_HEIGHT - div.height) / 2;
      createParticle(div, x, y);
    },
    [canvas, createParticle]
  );

  const onMouseUpPointerDiv = useCallback(() => {
    if (!canvas) return;

    canvas.animate(() => {
      animation("first");
    });

    setTimeout(() => {
      canvas.cancelAnimation();
      canvas.animate(() => {
        animation("second");
      });
    }, 1500);

    setTimeout(() => {
      canvas.cancelAnimation();
      canvas.animate(() => {
        animation("third");
      });
    }, 3000);
  }, [canvas, animation]);

  const drawText = useCallback(() => {
    if (!canvas) return;

    const FONT_SIZE = canvasFontSize(canvas.CANVAS_WIDTH);
    const LINE_VALUE = 5; // 줄 간격 값 5px
    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const totalHeight = text.length * FONT_SIZE + (LINE_VALUE * text.length - 1);
    const x = canvas.CANVAS_WIDTH / 2;
    const y = (canvas.CANVAS_HEIGHT - totalHeight) / 2 + FONT_SIZE;

    let met;
    let maxWidth = 0;
    let lineHeight = 0;

    const fontFile = new FontFace("KoPubWorld Medium", `url(${font_ttf}) format("truetype")`);
    document.fonts.add(fontFile);
    fontFile
      .load()
      .then(() => {
        ctx.font = `${FONT_SIZE}px KoPubWorld Medium`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";

        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], x, y + FONT_SIZE * i + lineHeight);
          lineHeight += LINE_VALUE;

          met = ctx.measureText(text[i]);
          if (!maxWidth) maxWidth = met.width;
          else if (maxWidth < met.width) maxWidth = met.width;
        }

        if (speechService.tts)
          speechService.synth.speak(text.join(""), {
            endEvent: () => {
              onMouseDownPointerDiv({ width: maxWidth, height: totalHeight });
              onMouseUpPointerDiv();
            },
          });
        else setPointerDiv({ width: maxWidth, height: totalHeight });
      })
      .catch((err: string) => {
        console.log(`font 에러 발생: ${err}`);
      });
  }, [canvas, text, speechService, onMouseDownPointerDiv, onMouseUpPointerDiv]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    canvas.setFrame(15);

    drawText();

    const myResize = debounce(() => {
      if (canvas.isAnim) return;

      canvas.init();
      drawText();
    }, 300);

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
  }, [canvas, drawText]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new Canvas(canvasRef.current);
      setCanvas(canvas);
      setMouse(new Mouse(canvas));
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;

    return () => {
      canvas.cancelAnimation();
      particles = null;
    };
  }, [canvas]);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      {pointerDiv && !speechService.tts && (
        <PointerDiv
          className="align-center"
          onMouseDown={() => {
            onMouseDownPointerDiv(pointerDiv);
          }}
          onMouseUp={() => {
            onMouseUpPointerDiv();
            setPointerDiv(null);
          }}
          onMouseLeave={() => {
            if (particles && !canvas?.isAnim) {
              onMouseUpPointerDiv();
              setPointerDiv(null);
            }
          }}
          $width={pointerDiv.width}
          $height={pointerDiv.height}
        />
      )}
    </>
  );
}
