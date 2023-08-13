import { useRef, useState, useEffect, useCallback } from "react";
import Canvas from "../utils/Canvas";
import { deepStrictEqual } from "assert";

type Props = {
  getDomainData: () => { bufferLength: number; dataArray: Uint8Array };
};

export default function LinearDataCanvas(props: Props) {
  const { getDomainData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

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
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.CANVAS_WIDTH, canvas.CANVAS_HEIGHT / 2);
    ctx.stroke();
  }, [canvas, getDomainData]);

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
