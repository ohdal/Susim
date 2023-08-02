import { useRef, useEffect, useState, useCallback, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomInt } from "../utils";
import Canvas from "../utils/Canvas";
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
  // background: rgba(201, 131, 131, 0.5);
  background: rgba(255, 255, 255, 0);
`;

type Props = {
  text: string[];
};

type PointerDiv = {
  width: number;
  height: number;
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
    const r = getRandomInt(0, 1);
    const angle = (Math.PI / 180) * getRandomInt(0, 360);

    this.x = x;
    this.y = y;
    this.firstPosX = r * Math.cos(angle);
    this.firstPosY = r * Math.sin(angle);
    this.speed = 1;
    this.friction = 0.9;

    this.opacity = opacity;
    this.ctx = ctx;
  }

  firstUpdate(): void {
    this.x += this.firstPosX * this.speed;
    this.y += this.firstPosY * this.speed;

    this.speed *= this.friction;
    this.opacity -= 0.025;
  }

  update(): void {
    this.opacity -= 0.02;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    // this.ctx.arc(this.x, this.y, 1, 0, (Math.PI / 180) * 360);
    // this.ctx.fill();
    this.ctx.fillRect(this.x, this.y, 1, 1);
    this.ctx.closePath();
  }
}

const particles: { [key: string]: Particle } = {};
const fontSize = 32;
export default function ScatterCanvas(props: Props) {
  const { text } = props;
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [pointerDiv, setPointerDiv] = useState<PointerDiv | null>(null);

  const createParticle = useCallback(
    (textInfo: PointerDiv, xPos: number, yPos: number) => {
      if (!canvas || !canvas.ctx) return;

      // particles = {};

      const ctx = canvas.ctx;
      const dpr = canvas.dpr;
      const met = textInfo;
      const width = Math.floor(met.width * dpr);

      const imgData = ctx.getImageData(xPos * dpr - met.width, yPos * dpr, met.width * dpr, met.height * dpr);

      canvas.clearCanvas();

      let count = 0;
      for (let i = 0; i < imgData.data.length; i += 8) {
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

      console.log(particles);
    },
    [canvas]
  );

  const drawText = useCallback(() => {
    if (!canvas) return;

    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const totalHeight = text.length * fontSize;
    const spacing = canvas.dpr * text.length;
    const x = canvas.CANVAS_WIDTH / 2;
    const y = (canvas.CANVAS_HEIGHT - totalHeight) / 2 + spacing;

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

    let met;
    let maxWidth = 0;
    for (let i = 0; i < text.length; i++) {
      ctx.font = `${fontSize}px Orbit`;
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text[i], x, y + fontSize * i);

      met = ctx.measureText(text[i]);
      if (!maxWidth) maxWidth = met.width;
      else if (maxWidth < met.width) maxWidth = met.width;
    }

    setPointerDiv({ width: maxWidth, height: totalHeight });
  }, [canvas, text]);

  const animation = useCallback(
    (isFirst: boolean, x?: number, y?: number): boolean => {
      if (Object.keys(particles).length === 0) {
        navigate("/main");
        return false;
      }

      for (const [key, value] of Object.entries(particles)) {
        if (isFirst) {
          value.draw();
          value.firstUpdate();

          if (value.opacity <= 0) {
            delete particles[key];
          }
          // if (value.speed <= 0.001) {
          //   navigate("/main");
          //   return false;
          // }
        } else {
          if (!x || !y) return false;
          value.draw();

          const coord = `${x}-${y}`;
          const particle = particles[coord];

          if (particle) {
            console.log(particle);
            for (let i = 0; i < 5; i++) {
              const coord = `${x - i}-${y - i}`;
              const coord2 = `${x + i}-${y + i}`;
              const other = particles[coord];
              const other2 = particles[coord2];

              if (other) other.update();
              if (other2) other2.update();
            }
          } else {
            return false;
          }
        }
      }

      return true;
    },
    [navigate]
  );

  const handleCanvas = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!canvas) return;

      console.log(e.clientX, e.clientY);

      // canvas.animate(() => {
      //   return animation(false, e.clientX, e.clientY);
      // });
    },
    [canvas, animation]
  );

  const handlePointerDiv = useCallback(() => {
    if (!canvas || !pointerDiv) return;

    const x = canvas.CANVAS_WIDTH / 2;
    const y = (canvas.CANVAS_HEIGHT - pointerDiv.height) / 2;
    createParticle(pointerDiv, x, y);
    // setPointerDiv(null);
  }, [canvas, pointerDiv, createParticle]);

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
      {pointerDiv && (
        <PointerDiv
          onMouseDown={handlePointerDiv}
          onMouseUp={() => {
            canvas?.animate(() => {
              return animation(true);
            });
            setPointerDiv(null);
          }}
          $width={pointerDiv.width}
          $height={pointerDiv.height}
        />
      )}
    </>
  );
}
