import { useRef, useEffect, useState, useCallback, useContext } from "react";
import { getRandomNum, debounce } from "../utils";
import { ServiceContext, mySynth } from "../utils/speechService";
import Canvas from "../utils/Canvas";
import Vector from "../utils/Vector";
import Mouse from "../utils/Mouse";
import styled from "styled-components";

import { canvasFontSize } from "../constant/Data";
import font_ttf from "../assets/fonts/GowunBatang-Regular.ttf";

// import text_img from "../assets/text_test.png";

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

class Particle {
  private pos: Vector;
  private firstPosX: number;
  private firstPosY: number;
  private friction: number;
  private radius: number;
  public speed: number;
  public opacity: number;
  private ctx: CanvasRenderingContext2D;
  public isTouched: boolean;

  constructor(x: number, y: number, opacity: number, ctx: CanvasRenderingContext2D) {
    const r = getRandomNum(0, 0.5);
    const angle = (Math.PI / 180) * getRandomNum(0, 360);

    this.pos = new Vector(x, y);
    this.firstPosX = r * Math.cos(angle);
    this.firstPosY = r * Math.sin(angle);
    this.radius = 20;
    this.speed = 0.95;
    this.friction = 0.9;

    this.opacity = opacity;
    this.ctx = ctx;
    this.isTouched = false;
  }

  firstUpdate(): void {
    if (Number(this.speed.toFixed(5)) === 0) return;

    this.pos.x += this.firstPosX * this.speed;
    this.pos.y += this.firstPosY * this.speed;

    this.speed *= this.friction;
  }

  update(mouse: Mouse): void {
    const dist = this.pos.dist(mouse.pos);

    if (this.isTouched) this.opacity -= 0.005;

    if (dist > this.radius) return;

    const { x: dx_m, y: dy_m } = Vector.sub(mouse.pos, mouse.oldPos);
    const { x: dx_c, y: dy_c } = Vector.sub(mouse.pos, this.pos);

    const dist_m = Math.sqrt(dx_m * dx_m + dy_m * dy_m); // 이전 마우스 위치와의 거리 구하기
    const dist_c = Math.sqrt(dx_c * dx_c + dy_c * dy_c); // 현재 파티클 위치와 마우스의 위치와의 거리 구하기

    const direction_m = new Vector(dx_m / dist_m, dy_m / dist_m); // 방향 벡터 구하기 - 마우스 방향대로 밀리는
    const direction_c = new Vector(dx_c / dist_c, dy_c / dist_c); // 방향 벡터 구하기 - 마우스 위치에서 떨어져서 미리는

    // direction_c - 마우스 포인터 위치에서 떨어지게끔 밀려야하므로 마이너스 값을 곱해준다.
    const randomNum_m = getRandomNum(20, 40);
    const randomNum_c = getRandomNum(-20, -5);
    const add_Vector = Vector.add(direction_m.mult(randomNum_m), direction_c.mult(randomNum_c));
    this.pos.add(add_Vector.x, add_Vector.y);

    if (!this.isTouched) this.isTouched = true;
  }

  update_opacity() {
    this.opacity -= 0.03;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
    this.ctx.closePath();
  }
}

let particles: { [key: string]: Particle } = {}; // 순서 x 객체 사용
let lastAnim = false,
  firstLength = 0,
  timeout_id: NodeJS.Timeout | null = null;
export default function ScatterCanvas(props: Props) {
  const { text, afterAnimationFunc } = props;
  const service = useContext(ServiceContext);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [pointerDiv, setPointerDiv] = useState<PointerDiv | null>(null);
  const [mouse, setMouse] = useState<Mouse | null>(null);

  const createParticle = useCallback(
    (textInfo: PointerDiv, xPos: number, yPos: number) => {
      if (!canvas || !canvas.ctx) return;

      const ctx = canvas.ctx;
      const dpr = canvas.dpr;
      const met = textInfo;
      const width = Math.floor(met.width * dpr);

      const imgData = ctx.getImageData(
        xPos * dpr - (met.width / 2) * dpr,
        yPos * dpr,
        met.width * dpr,
        met.height * dpr
      );

      canvas.clearCanvas();

      let count = 0;
      for (let i = 0; i < imgData.data.length; i += 4 * dpr) {
        count++;

        if (imgData.data[i + 3] > 125) {
          if (count % 2 === 0) continue;
          const x = (count % (width / dpr)) + (xPos - met.width / 2);
          const y = Math.floor(count / width) + yPos;
          const coordX = Math.floor(x);
          const coordY = Math.floor(y);

          particles[`${coordX}-${coordY}`] = new Particle(x - 1, y, imgData.data[i + 3] / 255, ctx);
          particles[`${coordX}-${coordY}`].draw();
        }
      }

      firstLength = Object.keys(particles).length;
    },
    [canvas]
  );

  const animation = useCallback(
    (isFirst: boolean): void => {
      const length = Object.keys(particles).length;
      if (length === 0) {
        afterAnimationFunc();
        canvas?.cancelAnimation();
      }

      for (const [key, value] of Object.entries(particles)) {
        if (isFirst) {
          lastAnim = false;
          value.draw();
          value.firstUpdate();
          if (!timeout_id)
            timeout_id = setTimeout(() => {
              lastAnim = true;
            }, 3000);
        } else {
          if (!mouse) return;

          value.draw();
          if (!lastAnim) value.update(mouse);
          else value.update_opacity();

          // if (value.opacity <= 0.2) delete particles[key];
          if (value.opacity <= 0) delete particles[key];
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
      return animation(true);
    });

    setTimeout(() => {
      canvas.cancelAnimation();
      canvas.animate(() => {
        animation(false);
      });
      timeout_id = null;
    }, 1500);
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

        if (service.tts)
          mySynth.speak(text.join(""), {
            end: () => {
              onMouseDownPointerDiv({ width: maxWidth, height: totalHeight });
              onMouseUpPointerDiv();
            },
          });
        else setPointerDiv({ width: maxWidth, height: totalHeight });
      })
      .catch((err: string) => {
        console.log(`font 에러 발생: ${err}`);
      });
  }, [canvas, text, service, onMouseDownPointerDiv, onMouseUpPointerDiv]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    canvas.setFrame(15);

    drawText();

    const myResize = debounce(() => {
      if (firstLength !== 0) return;

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
      particles = {};
      firstLength = 0;
    };
  }, [canvas]);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      {pointerDiv && !service.tts && (
        <PointerDiv
          className="align-center"
          onMouseDown={() => {
            onMouseDownPointerDiv(pointerDiv);
          }}
          onMouseUp={() => {
            onMouseUpPointerDiv();
            setPointerDiv(null);
          }}
          $width={pointerDiv.width}
          $height={pointerDiv.height}
        />
      )}
    </>
  );
}
