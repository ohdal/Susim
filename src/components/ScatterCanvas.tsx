import { useRef, useEffect, useState, useCallback } from "react";
import { getRandomNum } from "../utils";
import Canvas from "../utils/Canvas";
import Vector from "../utils/Vector";
import Mouse from "../utils/Mouse";
import styled from "styled-components";

import { canvasFontSize } from "../constant/Data";
import font_ttf from "../assets/fonts/KoPubWorld_Batang_Pro_Medium.ttf";

// import text_img from "../assets/text_test.png";

const PointerDiv = styled.div<{ $width: number; $height: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
    const add_Vector = Vector.add(direction_m.mult(10), direction_c.mult(-5));
    this.pos.add(add_Vector.x, add_Vector.y);

    if (!this.isTouched) this.isTouched = true;
  }

  update_opacity() {
    this.opacity -= 0.02;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
    this.ctx.closePath();
  }
}

let particles: { [key: string]: Particle } = {}; // 순서 x 객체 사용
let firstLength = 0;
export default function ScatterCanvas(props: Props) {
  const { text, afterAnimationFunc } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [pointerDiv, setPointerDiv] = useState<PointerDiv | null>(null);
  const [mouse, setMouse] = useState<Mouse | null>(null);

  const getFontSize = useCallback((width: number) => {
    if (width > 1200) {
      return canvasFontSize["xl"];
    } else if (width > 992) {
      return canvasFontSize["lg"];
    } else if (width > 768) {
      return canvasFontSize["md"];
    } else if (width > 576) {
      return canvasFontSize["sm"];
    } else {
      return 12;
    }
  }, []);

  const createParticle = useCallback(
    (textInfo: PointerDiv, xPos: number, yPos: number) => {
      if (!canvas || !canvas.ctx) return;

      const ctx = canvas.ctx;
      const dpr = canvas.dpr;
      const met = textInfo;
      const width = Math.floor(met.width * dpr);

      const imgData = ctx.getImageData(xPos * dpr - met.width, yPos * dpr, met.width * dpr, met.height * dpr);

      canvas.clearCanvas();

      let count = 0;
      for (let i = 0; i < imgData.data.length; i += 4 * dpr) {
        count++;

        if (imgData.data[i + 3] !== 0) {
          const x = (count % (width / 2)) + (xPos - met.width / 2);
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

  const drawText = useCallback(() => {
    if (!canvas) return;

    const FONT_SIZE = getFontSize(canvas.CANVAS_WIDTH);
    const LINE_VALUE = 5; // 줄 간격 값 5px
    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const totalHeight = text.length * FONT_SIZE + (LINE_VALUE * text.length - 1);
    const spacing = canvas.dpr * text.length;
    const x = canvas.CANVAS_WIDTH / 2;
    const y = (canvas.CANVAS_HEIGHT - totalHeight) / 2 + spacing;

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
        ctx.textBaseline = "middle";

        for (let i = 0; i < text.length; i++) {
          ctx.fillText(text[i], x, y + FONT_SIZE * i + lineHeight);
          lineHeight += LINE_VALUE;

          met = ctx.measureText(text[i]);
          if (!maxWidth) maxWidth = met.width;
          else if (maxWidth < met.width) maxWidth = met.width;
        }

        setPointerDiv({ width: maxWidth, height: totalHeight });
      })
      .catch((err: string) => {
        console.log(`font 에러 발생: ${err}`);
      });
  }, [canvas, text, getFontSize]);

  const animation = useCallback(
    (isFirst: boolean): void => {
      const length = Object.keys(particles).length;
      if (length === 0) {
        afterAnimationFunc();
      }

      for (const [key, value] of Object.entries(particles)) {
        if (isFirst) {
          value.draw();
          value.firstUpdate();
        } else {
          if (!mouse) return;

          value.draw();
          if ((firstLength / 3) * 2 > length) {
            value.update_opacity();
          } else {
            value.update(mouse);
          }

          // if (value.opacity <= 0.2) delete particles[key];
          if (value.opacity <= 0) delete particles[key];
        }
      }
    },
    [mouse, afterAnimationFunc]
  );

  const onMouseDownPointerDiv = useCallback(() => {
    if (!canvas || !pointerDiv) return;

    const x = canvas.CANVAS_WIDTH / 2;
    const y = (canvas.CANVAS_HEIGHT - pointerDiv.height) / 2;
    createParticle(pointerDiv, x, y);
  }, [canvas, pointerDiv, createParticle]);

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
    }, 1500);

    setPointerDiv(null);
  }, [canvas, animation]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    canvas.setFrame(15);
    drawText();

    const myResize = () => {
      if (firstLength !== 0) return;

      canvas.init();
      drawText();
    };

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
  }, [canvas, drawText, animation]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;

    setMouse(new Mouse(canvas));

    return () => {
      canvas.cancelAnimation();
      particles = {};
      firstLength = 0;
    };
  }, [canvas]);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      {pointerDiv && (
        <PointerDiv
          onMouseDown={onMouseDownPointerDiv}
          onMouseUp={onMouseUpPointerDiv}
          $width={pointerDiv.width}
          $height={pointerDiv.height}
        />
      )}
    </>
  );
}
