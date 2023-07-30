import { useRef, useEffect, useState, useCallback, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomInt } from "../utils";
import Canvas from "../js/Canvas";
import styled from "styled-components";

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
  text: string;
};

class Particle {
  private x: number;
  private y: number;
  private firstPosX: number;
  private firstPosY: number;
  private friction: number;
  public speed: number;
  public opacity: number;
  private ctx: CanvasRenderingContext2D;

  constructor(x: number, y: number, opacity: number, ctx: CanvasRenderingContext2D) {
    this.x = x;
    this.y = y;
    this.firstPosX = getRandomInt(-1, 2);
    this.firstPosY = getRandomInt(-1, 2);
    this.speed = 1;
    this.friction = 0.9;

    this.opacity = opacity;
    this.ctx = ctx;
  }

  firstUpdate(): void {
    this.x += this.firstPosX * this.speed;
    this.y += this.firstPosY * this.speed;

    this.speed *= this.friction;
    this.opacity -= 0.02;
  }

  update(): void {
    this.opacity -= 0.02;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    // ctx.arc((count % width) + 100, Math.floor((count / width)) + 100, 1, 0, (Math.PI / 180) * 360);
    // ctx.fill();
    this.ctx.fillRect(this.x, this.y, 1, 1);
    this.ctx.closePath();
  }
}

const particles: { [key: string]: Particle } = {};
export default function ScatterCanvas(props: Props) {
  const { text } = props;
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [pointerDiv, setPointerDiv] = useState<{ width: number; height: number } | null>(null);

  const createParticle = useCallback(
    (text: string, xPos: number, yPos: number) => {
      if (!canvas || !canvas.ctx) return;

      // particles = {};

      const ctx = canvas.ctx;
      const dpr = canvas.dpr;
      const met = ctx.measureText(text);
      const width = Math.floor(met.width * dpr);

      const imgData = ctx.getImageData(xPos * dpr - met.width, yPos * dpr - 40, met.width * dpr, 40 * dpr);
      canvas.clearCanvas();

      let count = 0;
      for (let i = 0; i < imgData.data.length; i += 8) {
        count++;

        if (imgData.data[i + 3] !== 0) {
          const x = (count % (width / 2)) + (xPos - met.width / 2); // 100 임시
          const y = Math.floor(count / width) + (yPos - 19);

          particles[`${x}-${y}`] = new Particle(x - 1, y, imgData.data[i + 3] / 255, ctx);
          particles[`${x}-${y}`].draw();
        }
      }
    },
    [canvas]
  );

  const drawText = useCallback(() => {
    if (!canvas) return;

    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const x = canvas.CANVAS_WIDTH / 2;
    const y = canvas.CANVAS_HEIGHT / 2;

    // const img: HTMLImageElement = new Image();
    // img.src = text_img;

    // const imgX = x - img.width / 2;
    // const imgY = y - img.height / 2;
    // let imgData = null;

    // img.onload = () => {
    //   ctx.drawImage(img, imgX, imgY);

    //   const imgData = ctx.getImageData(imgX * 2, imgY * 2, img.width * 2, img.height * 2);

    //   console.log(img.width)
    // const obj: { [key: string]: number } = {};
    // ctx.beginPath();
    // for (let i = 0; i < imgData.data.length; i += 4) {
    // if (imgData.data[i + 0] !== 0) {
    // ctx.fillStyle = `rgba(255, 255, 255, ${(imgData.data[i + 3] / 255) * 100})`;
    // ctx.arc((i % img.width) * 2, Math.floor((i / img.width) * 2), 1, 0, (Math.PI / 180) * 360);
    // ctx.fill();
    // }
    // const key: string = imgData.data[i].toString();
    // if (!obj[key]) obj[key] = 0;
    // obj[key]++;
    // }
    // ctx.closePath();

    // console.log(obj);
    // ctx.putImageData(imgData, 100, 100);
    // };

    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "36px san-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.closePath();

    const met = ctx.measureText(text);
    setPointerDiv({ width: met.width, height: 40 });
  }, [canvas, text]);

  const animation = useCallback((isFirst = false): boolean => {
    if (Object.keys(particles).length === 0) {
      navigate("/main");
      return false;
    }

    for (const [key, value] of Object.entries(particles)) {
      value.draw();
      if (isFirst) {
        value.firstUpdate();

        if (value.opacity <= 0) delete particles[key];
        // if (value.speed <= 0) {
        //   return false;
        // }
      } else {
        value.update();

        if (value.opacity <= 0) delete particles[key];
      }
    }

    return true;
  }, []);

  const handleCanvas = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    console.log(e.clientX, e.clientY);
  }, []);

  const handlePointerDiv = useCallback(() => {
    if (!canvas) return;

    createParticle(text, canvas.CANVAS_WIDTH / 2, canvas.CANVAS_HEIGHT / 2);
    setPointerDiv(null);

    canvas.animate(() => {
      return animation(true);
    });
  }, [canvas, text, createParticle, animation]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    drawText();

    window.addEventListener("resize", () => {
      canvas.init();
      drawText();
    });
  }, [canvas, drawText, animation]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef} onClick={handleCanvas}></canvas>
      {pointerDiv && <PointerDiv onClick={handlePointerDiv} $width={pointerDiv.width} $height={pointerDiv.height} />}
    </>
  );
}
