import { useRef, useState, useEffect, useCallback } from "react";
import { getRandomNum } from "../utils";
import Canvas from "../utils/Canvas";

type Props = {
  getDomainData: () => { bufferLength: number; dataArray: Uint8Array };
};

type dotDataType = { x: number; y: number };
type dotGroupType = dotDataType[];
type lineType = dotGroupType[];
type lineInfoType = { yPos: number; per?: number; particle?: number; large?: boolean };

class Queue {
  private arr: number[];
  private buffer: number;

  constructor(bufferLength: number, data: Uint8Array) {
    this.arr = this.filterData(data);
    this.buffer = bufferLength;
  }

  setData(data: Uint8Array) {
    if (this.arr.length >= this.buffer * 2) return;

    const filter = this.filterData(data);
    if (filter.length === 0) return;

    const last = this.arr[this.arr.length - 1];
    const first = filter[0];
    const diff = Math.abs(last - first);
    const arrCor = [];

    if (diff > 10) {
      const value = Math.floor(diff / 5);

      for (let i = 1; i <= 4; i++) {
        if (last > first) arrCor.push(last - value * i);
        else arrCor.push(last + value * i);
      }
    }

    this.arr.push(...arrCor, ...filter);
  }

  getLength(): number {
    return this.arr.length;
  }

  getData(idx: number): number {
    const value = this.arr[idx];

    return value;
  }

  shiftData() {
    this.arr.shift();
    this.arr.shift();
  }

  filterData(data: Uint8Array): number[] {
    return Array.from(data).filter((v) => !(v < 129 && v > 126));
  }
}

let queue: Queue | null = null;
let lineArr: lineType = [];
const lineInfoArr: lineInfoType[] = [
  { yPos: -92 },
  { yPos: -82 },
  { yPos: 0 },
  { yPos: 10, per: 66, particle: 5, large: true },
  { yPos: 30, per: 60, particle: 4, large: true },
  { yPos: 40, per: 55, particle: 3, large: true },
  { yPos: 70, per: 50, large: true },
  { yPos: 100, per: 40 },
  { yPos: 130, per: 40 },
  { yPos: 200, per: 20 },
  { yPos: 220, per: 10 },
];
export default function LinearDataCanvas(props: Props) {
  const { getDomainData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const saveDot = useCallback((arr: dotGroupType, data: dotDataType, info: lineInfoType) => {
    const { yPos, per, particle, large } = info;

    const num = getRandomNum(0, 1000, true);
    const isOrigin = yPos === 0;
    const standard = isOrigin ? 1000 : per ? 10 * per : 300;

    if (num <= standard && arr) {
      arr.push(data);

      if (isOrigin) {
        arr.push({ x: data.x + getRandomNum(1, 5), y: data.y });
        arr.push({ x: data.x, y: data.y + getRandomNum(1, 5) });
      } else {
        const size = particle ? particle : 2;

        for (let i = 0; i < size; i++) {
          arr.push({ x: data.x + getRandomNum(10, 20), y: data.y + getRandomNum(5, large ? 20 : 10) });
        }
      }
    }
  }, []);

  const drawDot = useCallback(
    (arr: dotGroupType, info: lineInfoType) => {
      if (!canvas) return;

      const { yPos } = info;
      const isOrigin = yPos === 0;
      const ctx = canvas.ctx as CanvasRenderingContext2D;

      if (arr) {
        arr.forEach(({ x, y }) => {
          const opacity = isOrigin ? getRandomNum(0.7, 1) : getRandomNum(0.2, 1);

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.arc(x + (yPos < 0 ? 10 : 0), y - yPos, 2, 0, (Math.PI / 180) * 360);
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

    if (!queue) {
      queue = new Queue(bufferLength, dataArray);
    } else {
      queue.setData(dataArray);
    }

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.CANVAS_WIDTH, canvas.CANVAS_HEIGHT);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(255, 255, 255)";

    ctx.beginPath();

    const sliceWidth = (canvas.CANVAS_WIDTH * 1.0) / bufferLength;
    let x = 0;

    lineArr = [];
    for (let i = 0; i < queue.getLength(); i++) {
      const data = queue.getData(i);
      const v = data / 128.0;
      const y = (v * canvas.CANVAS_HEIGHT) / 2;

      if (i === 0) {
        for (let i = 0; i < lineInfoArr.length; i++) {
          lineArr.push([]);
        }
        // ctx.moveTo(x, y);
      } else {
        // ctx.lineTo(x, y);

        for (let i = 0; i < lineArr.length; i++) {
          saveDot(lineArr[i], { x, y }, lineInfoArr[i]);
        }
      }

      x += sliceWidth;
    }

    // ctx.lineTo(x, canvas.CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.closePath();

    queue.shiftData();

    for (let i = 0; i < lineArr.length; i++) {
      drawDot(lineArr[i], lineInfoArr[i]);
    }
  }, [canvas, getDomainData, drawDot, saveDot]);

  useEffect(() => {
    if (!canvas) return;
    canvas.init();
    canvas.setFrame(5);
    canvas.animate(draw);

    window.addEventListener("resize", () => {
      canvas.init();
    });

    return () => {
      canvas.cancelAnimation();
      lineArr = [];
      queue = null;
    };
  }, [canvas, draw]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
