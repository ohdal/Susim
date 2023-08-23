import { useRef, useState, useEffect, useCallback } from "react";
import { getRandomInt } from "../utils";
import Canvas from "../utils/Canvas";

type Props = {
  getDomainData: () => { bufferLength: number; dataArray: Uint8Array };
};

type dotDataType = { x: number; y: number };
type dotArrType = dotDataType[] | null;

class Queue {
  private arr_origin: number[];
  private arr: number[];
  private buffer: number;

  constructor(bufferLength: number, data: Uint8Array) {
    this.arr_origin = this.filterData(data);
    this.arr = this.filterData(data);
    this.buffer = bufferLength;
  }

  setData_horizontal(data: Uint8Array) {
    if (this.arr_origin.length >= this.buffer * 2) return;

    const temp = this.filterData(data);

    this.arr_origin.push(...temp);
    this.arr.push(...temp);
  }

  setData_vertical() {
    console.log("vertical");
  }

  getLength(): number {
    return this.arr_origin.length;
  }

  getData(idx: number): number {
    const value = this.arr[idx];

    return value;
  }

  shiftData() {
    // const SIZE_VALUE = 20;

    // for (let i = 0; i < this.arr.length; i++) {
    //   const v_origin = this.arr_origin[i];
    //   const v = this.arr[i];
    //   const

    //   let isUp: boolean;
    //   if(v_origin > 128.0) {

    //   } else {
    //     isUp = true;
    //   }

    //   if(isUp) {
    //     this.arr[i]++;
    //   } else {
    //     this.arr[i]--;
    //   }
    // }

    this.arr_origin.shift();
    this.arr_origin.shift();
    this.arr.shift();
    this.arr.shift();
  }

  filterData(data: Uint8Array): number[] {
    return Array.from(data).filter((v) => !(v < 129 && v > 126));
  }
}

let queue: Queue | null = null;
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

    if (!queue) {
      queue = new Queue(bufferLength, dataArray);

      // setInterval(() => {
      //   const { dataArray } = getDomainData();
      //   queue?.setData_horizontal(dataArray);

      //   console.log(queue?.getLength());
      // }, 1000);
    } else {
      queue.setData_horizontal(dataArray);
    }

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

    ctx.lineTo(x, canvas.CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.closePath();

    queue.shiftData();

    drawDot(dotArr_1, { color: "red", yPos: 80 });
    drawDot(dotArr_2, { color: "yellow", yPos: 30 });
    drawDot(dotArr_3, { color: "green", yPos: 10 });
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
    };
  }, [canvas, draw]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
