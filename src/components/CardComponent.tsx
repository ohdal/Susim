import React, { useEffect, useState, useRef, useMemo } from "react";
import styled from "styled-components";
import LinearDataCanvas, { lineType, LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import { debounce } from "../utils";

type CardProps = {
  // data: lineType;
  data: string;
  // canvasInfo: { width: number; height: number };
  canvasInfo: string;
  text: string;
};

const CardLayout = styled.div`
  position: relative;
  height: 18.75rem;
  cursor: pointer;

  .front,
  .back {
    width: 100%;
    height: 100%;
    border: 1px solid #ffffff;
    border-radius: 10px;
    padding: 5px;
    transition: all 0.8s ease-out;
  }

  .front {
    contain: content;
    background: #000000;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transform: rotateY(180deg);
    background: #ffffff;
    color: #000000;
  }

  &.clicked {
    .front {
      transform: rotateY(-180deg);
      z-index: -2;
    }

    .back {
      transform: rotateY(0deg);
      z-index: 0;
    }
  }
`;

const CardComponent = (props: CardProps) => {
  const { data, text, canvasInfo } = props;
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<LinearDataCanvasHandle | null>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !layoutRef.current) return;

    const myResize = debounce(() => {
      const width = (layoutRef.current?.clientWidth as number) - 10;
      const height = (layoutRef.current?.clientHeight as number) - 10;
      canvasRef.current?.canvasResize(width, height);
      canvasRef.current?.currentDraw(
        JSON.parse(data) as lineType,
        JSON.parse(canvasInfo) as { width: number; height: number }
      );
    }, 300);

    myResize();

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
  }, [data, canvasInfo]);

  return (
    <CardLayout
      ref={layoutRef}
      className={clicked ? "clicked" : ""}
      onClick={() => {
        setClicked((v) => !v);
      }}
    >
      <div className="front">
        <LinearDataCanvas ref={canvasRef} />
      </div>
      <div className="back">{text}</div>
    </CardLayout>
  );
};

function cardPropsAreEqual(prev: CardProps, next: CardProps) {
  return prev.data === next.data;
}

export default React.memo(CardComponent, cardPropsAreEqual);
