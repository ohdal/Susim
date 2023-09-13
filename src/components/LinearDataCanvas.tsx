import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { getRandomNum, hexToRgb, debounce } from "../utils";
import Canvas from "../utils/Canvas";

type Props = {
  getDomainData?: () => { bufferLength: number; dataArray: Uint8Array };
};

export interface LinearDataCanvasHandle {
  stopAnimation: () => void;
  currentDraw: (arr?: lineType, canvasInfo?: { width: number; height: number }) => void;
  canvasResize: (width: number, height: number) => void;
  getLinearData: () => { data: lineType; width: number; height: number };
  getImageData: () => string | null;
  fillUp: (v: string) => void;
}

type dotDataType = { x: number; y: number };
type dotGroupType = dotDataType[];
export type lineType = dotGroupType[];
type lineInfoType = { yPos: number; per?: number; particle?: number; large?: boolean };

class Queue {
  private arr: number[];
  private buffer: number;

  constructor(bufferLength: number, data: Uint8Array) {
    this.arr = this.filterData(data);
    this.buffer = bufferLength;
  }

  setData(data: Uint8Array) {
    this.arr = this.filterData(data);
    return;

    // if (this.arr.length >= this.buffer * 2) return;

    // const filter = this.filterData(data);
    // if (filter.length === 0) return;

    // const last = this.arr[this.arr.length - 1];
    // const first = filter[0];
    // const diff = Math.abs(last - first);
    // const arrCor = [];

    // if (diff > 10) {
    //   const value = Math.floor(diff / 5);

    //   for (let i = 1; i <= 4; i++) {
    //     if (last > first) arrCor.push(last - value * i);
    //     else arrCor.push(last + value * i);
    //   }
    // }

    // this.arr.push(...arrCor, ...filter);
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
    // return Array.from(data).filter((v) => !(v < 129 && v > 126));
    return Array.from(data);
  }
}

let queue: Queue | null = null;
let lineArr: lineType = [];
const lineInfoArr: lineInfoType[] = [
  { yPos: -122 },
  { yPos: -92 },
  { yPos: 0 },
  { yPos: 10, per: 66, particle: 5, large: true },
  { yPos: 30, per: 60, particle: 5, large: true },
  { yPos: 40, per: 55, particle: 5, large: true },
  { yPos: 70, per: 50, particle: 4, large: true },
  { yPos: 100, per: 40 },
  { yPos: 130, per: 40 },
  { yPos: 200, per: 20 },
  { yPos: 240, per: 10, large: true },
];
let yPosCount = 0;

const LinearDataCanvas = forwardRef<LinearDataCanvasHandle, Props>((props, ref) => {
  const { getDomainData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useImperativeHandle(ref, () => ({
    stopAnimation,
    currentDraw,
    canvasResize,
    getLinearData,
    getImageData,
    fillUp: (v) => {
      const value = -4 * v.length;
      yPosCount = Math.max(value, -300);
    },
  }));

  const stopAnimation = useCallback((): void => {
    if (!canvas) return;

    canvas.cancelAnimation();
  }, [canvas]);

  const canvasResize = useCallback(
    (width: number, height: number) => {
      if (!canvas) return;

      canvas.init(width, height);
    },
    [canvas]
  );

  const getLinearData = useCallback((): { data: lineType; width: number; height: number } => {
    const width = canvas?.CANVAS_WIDTH as number;
    const height = canvas?.CANVAS_HEIGHT as number;

    return { data: lineArr, width, height };
  }, [canvas]);

  const getImageData = useCallback((): string |  null => {
    if (!canvas) return null;

    return canvas.element.toDataURL();
  }, [canvas]);

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
    (arr: dotGroupType, info: lineInfoType, ratio: { x: number; y: number }, color = "#ffffff") => {
      if (!canvas) return;

      const { yPos } = info;
      const { r, g, b } = hexToRgb(color) || { r: 255, g: 255, b: 255 };
      const isOrigin = yPos === 0;
      const ctx = canvas.ctx as CanvasRenderingContext2D;

      if (arr) {
        const v = Math.floor(1 / ratio.x);
        for (let i = 0; i < arr.length; i += v > 1 ? v : 1) {
          const { x, y } = arr[i];
          const opacity = isOrigin ? getRandomNum(0.7, 1) : getRandomNum(0.2, 1);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.arc((x + (yPos < 0 ? 10 : 0)) * ratio.x, (y - yPos) * ratio.y, 2, 0, (Math.PI / 180) * 360);
          ctx.fill();
          ctx.closePath();
        }
      }
    },
    [canvas]
  );

  const currentDraw = useCallback(
    (arr?: lineType, canvasInfo?: { width: number; height: number }): void => {
      if (!arr) arr = lineArr;
      if (!canvas) return;

      canvas.clearCanvas();

      const ratio = { x: 1, y: 1 };
      if (canvasInfo) {
        const { width, height } = canvasInfo;
        const isUpWidth = width < canvas.CANVAS_WIDTH;
        const isUpHeight = height < canvas.CANVAS_HEIGHT;

        ratio.x = isUpWidth ? width / canvas.CANVAS_WIDTH : canvas.CANVAS_WIDTH / width;
        ratio.y = isUpHeight ? height / canvas.CANVAS_HEIGHT : canvas.CANVAS_HEIGHT / height;
      }

      for (let i = 0; i < arr.length; i++) {
        drawDot(arr[i], lineInfoArr[i], ratio);
      }
    },
    [drawDot, canvas]
  );

  const draw = useCallback(() => {
    if (!canvas || !getDomainData) return;

    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const { bufferLength, dataArray } = getDomainData();

    if (!queue) {
      queue = new Queue(bufferLength, dataArray);

      // setInterval(() => {
      //   const { dataArray } = getDomainData();
      //   queue?.setData(dataArray);
      // }, 1000);
    } else {
      queue.setData(dataArray);
    }

    lineArr = [];

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.CANVAS_WIDTH, canvas.CANVAS_HEIGHT);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(255, 255, 255)";

    ctx.beginPath();

    const sliceWidth = (canvas.CANVAS_WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < queue.getLength(); i++) {
      const data = queue.getData(i);
      const v = data / 128.0;
      const y = (v * canvas.CANVAS_HEIGHT) / 1.4 + yPosCount;

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

    currentDraw(lineArr);

    // queue.shiftData();
  }, [canvas, getDomainData, saveDot, currentDraw]);

  useEffect(() => {
    if (!canvas || !getDomainData) return;

    const myResize = debounce(() => {
      canvas.init();
    }, 300);

    canvas.setFrame(3);
    canvas.animate(draw);

    myResize();

    window.addEventListener("resize", myResize);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", myResize);
    };
  }, [canvas, draw, stopAnimation, getDomainData]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));

      queue = null;
      lineArr = [];
      yPosCount = 0;
    }
  }, []);

  return <canvas style={{ zIndex: 0 }} ref={canvasRef} />;
});

export default LinearDataCanvas;
