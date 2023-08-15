import { useRef, useState, useEffect, useCallback } from "react";
import { getRandomInt } from "../utils";
import Canvas from "../utils/Canvas";

type Props = {
  getDomainData: () => { bufferLength: number; dataArray: Uint8Array };
};

type dotDataType = { x: number; y: number };
type dotArrType = dotDataType[] | null;
let dotArr_1: dotArrType = null;
let dotArr_2: dotArrType = null;
let dotArr_3: dotArrType = null;
export default function LinearDataCanvas(props: Props) {
  const { getDomainData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const saveDot = useCallback((arr: dotArrType, data: dotDataType) => {
    const num = getRandomInt(0, 1000);

    if (num <= 300 && arr) {
      arr.push(data);
    }
  }, []);

  const drawDot = useCallback(
    (arr: dotArrType, style: { color: string; yPos: number }) => {
      if (!canvas) return;

      const ctx = canvas.ctx as CanvasRenderingContext2D;

      if (arr) {
        arr.forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.fillStyle = style.color;
          ctx.arc(x, y - style.yPos, 1, 0, (Math.PI / 180) * 360);
          ctx.fill();
          ctx.closePath();
        });
      }
    },
    [canvas]
  );

  const draw = useCallback(() => {
    if (!canvas) return;

    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const { bufferLength, dataArray } = getDomainData();

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.CANVAS_WIDTH, canvas.CANVAS_HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(255, 255, 255)";

    ctx.beginPath();

    const sliceWidth = (canvas.CANVAS_WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.CANVAS_HEIGHT) / 2;

      if (i === 0) {
        dotArr_1 = [];
        dotArr_2 = [];
        dotArr_3 = [];
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);

        saveDot(dotArr_1, { x, y });
        saveDot(dotArr_2, { x, y });
        saveDot(dotArr_3, { x, y });
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.CANVAS_WIDTH, canvas.CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.closePath();

    drawDot(dotArr_1, { color: "red", yPos: 80 });
    drawDot(dotArr_2, { color: "yellow", yPos: 30 });
    drawDot(dotArr_3, { color: "green", yPos: 10 });
  }, [canvas, getDomainData, drawDot, saveDot]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    canvas.animate(draw);

    window.addEventListener("resize", () => {
      canvas.init();
    });
  }, [canvas, draw]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
