import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { getRandomNum, hexToRgb, debounce } from "../utils";
import Canvas from "../utils/Canvas";

type Props = {
  getDomainData?: () => { bufferLength: number; dataArray: Uint8Array };
};

export interface LinearDataCanvasHandle {
  stopAnimation: () => void;
  mergeAnimation: (v: string, canvasInfo: string, func: () => void) => void;
  currentDraw: (arr?: lineGroupType, canvasInfo?: canvasInfoType) => void;
  canvasResize: (width: number, height: number) => void;
  getLinearData: () => { data: lineGroupType; width: number; height: number };
  getImageData: () => string | null;
  fillUp: (v: string) => void;
}

type canvasInfoType = { width: number; height: number };
type dotDataType = { x: number; y: number; opacity?: number };
type lineType = dotDataType[];
export type lineGroupType = lineType[];
type lineInfoType = { yPos: number; per?: number; particle?: number; large?: boolean };

let particles: number[] | null = null;
let lineArr: lineGroupType = [];
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
    mergeAnimation: (v, canvasInfo, func) => {
      if (canvas) {
        const data: lineGroupType = JSON.parse(v);
        const info: canvasInfoType = JSON.parse(canvasInfo);
        canvas.setFrame(10);
        canvas.animate(() => animationMerge(lineArr, data, info, func));
      }
    },
    currentDraw,
    canvasResize,
    getLinearData,
    getImageData,
    fillUp: (v) => {
      const value = -4 * v.length;
      yPosCount = Math.max(value, -400);
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

  const getLinearData = useCallback((): { data: lineGroupType; width: number; height: number } => {
    const width = canvas?.CANVAS_WIDTH as number;
    const height = canvas?.CANVAS_HEIGHT as number;

    return { data: lineArr, width, height };
  }, [canvas]);

  const getImageData = useCallback((): string | null => {
    if (!canvas) return null;

    return canvas.element.toDataURL();
  }, [canvas]);

  const getRandomOpacity = useCallback((isOrigin = false): number => {
    return isOrigin ? getRandomNum(0.7, 1) : getRandomNum(0.2, 1);
  }, []);

  const getCanvasRatio = useCallback(
    ({ width, height }: canvasInfoType): { x: number; y: number } => {
      const ratio = { x: 1, y: 1 };
      if (canvas) {
        const isUpWidth = width < canvas.CANVAS_WIDTH;
        const isUpHeight = height < canvas.CANVAS_HEIGHT;

        ratio.x = isUpWidth ? width / canvas.CANVAS_WIDTH : canvas.CANVAS_WIDTH / width;
        ratio.y = isUpHeight ? height / canvas.CANVAS_HEIGHT : canvas.CANVAS_HEIGHT / height;
      }

      return ratio;
    },
    [canvas]
  );

  const saveDot = useCallback(
    (arr: lineType, data: dotDataType, info: lineInfoType) => {
      const { yPos, per, particle, large } = info;

      const num = getRandomNum(0, 1000, true);
      const isOrigin = yPos === 0;
      const standard = isOrigin ? 1000 : per ? 10 * per : 300;

      if (num <= standard && arr) {
        arr.push(Object.assign(data, { opacity: getRandomOpacity(isOrigin) }));

        if (isOrigin) {
          arr.push({ x: data.x + getRandomNum(1, 5), y: data.y, opacity: getRandomOpacity(isOrigin) });
          arr.push({ x: data.x, y: data.y + getRandomNum(1, 5), opacity: getRandomOpacity(isOrigin) });
        } else {
          const size = particle ? particle : 2;

          for (let i = 0; i < size; i++) {
            const opacity = getRandomOpacity(isOrigin);
            arr.push({ x: data.x + getRandomNum(10, 20), y: data.y + getRandomNum(5, large ? 20 : 10), opacity });
          }
        }
      }
    },
    [getRandomOpacity]
  );

  const drawDot = useCallback(
    (arr: lineType, info: lineInfoType, ratio = { x: 1, y: 1 }, color = "#ffffff") => {
      if (!canvas) return;

      const { yPos } = info;
      const { r, g, b } = hexToRgb(color) || { r: 255, g: 255, b: 255 };
      const ctx = canvas.ctx as CanvasRenderingContext2D;

      if (arr) {
        const v = Math.floor(1 / ratio.x);
        for (let i = 0; i < arr.length; i += v > 1 ? v : 1) {
          const { x, y, opacity } = arr[i];

          ctx.beginPath();
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity as number})`;
          ctx.arc((x + (yPos < 0 ? 10 : 0)) * ratio.x, (y - yPos) * ratio.y, 1, 0, (Math.PI / 180) * 360);
          ctx.fill();
          ctx.closePath();
        }
      }
    },
    [canvas]
  );

  const currentDraw = useCallback(
    (arr?: lineGroupType, canvasInfo?: canvasInfoType): void => {
      if (!arr) arr = lineArr;
      if (!canvas) return;

      canvas.clearCanvas();

      let ratio;
      if (canvasInfo) ratio = getCanvasRatio(canvasInfo);

      for (let i = 0; i < arr.length; i++) {
        drawDot(arr[i], lineInfoArr[i], ratio);
      }
    },
    [drawDot, getCanvasRatio, canvas]
  );

  const animationDefault = useCallback(() => {
    if (!canvas || !getDomainData) return;

    const ctx = canvas.ctx as CanvasRenderingContext2D;
    const { bufferLength, dataArray } = getDomainData();

    particles = Array.from(dataArray);

    lineArr = [];

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(255, 255, 255)";

    ctx.beginPath();

    const sliceWidth = (canvas.CANVAS_WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < particles.length; i++) {
      const data = particles[i];
      const v = data / 128.0;
      const y = (v * canvas.CANVAS_HEIGHT) / 1.2 + yPosCount;

      if (i === 0) {
        for (let i = 0; i < lineInfoArr.length; i++) {
          lineArr.push([]);
        }
      } else {
        for (let i = 0; i < lineArr.length; i++) {
          saveDot(lineArr[i], { x, y }, lineInfoArr[i]);
        }
      }

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.closePath();

    currentDraw(lineArr);
  }, [canvas, getDomainData, saveDot, currentDraw]);

  const animationMerge = useCallback(
    (baseData: lineGroupType, mergeData: lineGroupType, mergeCanvasInfo: canvasInfoType, afterFunc: () => void) => {
      if (!canvas) return;

      const count = canvas.getAnimCount();
      const width = canvas.CANVAS_WIDTH;
      const ratio = getCanvasRatio(mergeCanvasInfo);

      for (let i = 0; i < mergeData.length; i++) {
        if (width - count < 0) {
          afterFunc();
          break;
        }

        baseData[i] = baseData[i].filter((v) => Math.round(v.x) < width - count);
        const mergeResult = mergeData[i].filter((v) => Math.round(v.x * ratio.x) > width - count);

        drawDot(baseData[i], lineInfoArr[i]);
        drawDot(mergeResult, lineInfoArr[i], ratio);
      }
    },
    [drawDot, canvas, getCanvasRatio]
  );

  useEffect(() => {
    if (!canvas || !getDomainData) return;

    const myResize = debounce(() => {
      canvas.init();
    }, 300);

    canvas.setFrame(3);
    canvas.animate(animationDefault);

    myResize();

    window.addEventListener("resize", myResize);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", myResize);
    };
  }, [canvas, animationDefault, stopAnimation, getDomainData]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(new Canvas(canvasRef.current));

      particles = null;
      lineArr = [];
      yPosCount = 0;
    }
  }, []);

  return <canvas style={{ zIndex: 0 }} ref={canvasRef} />;
});

export default LinearDataCanvas;
