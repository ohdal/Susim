import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Scrollbars } from "react-custom-scrollbars";

import background_archive from "../assets/images/background_archive.png";

import LinearDataCanvas, { lineType, LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import { debounce } from "../utils";

type CardProps = {
  // data: lineType;
  data: string;
  // canvasInfo: { width: number; height: number };
  canvasInfo: string;
  text: string;
};

const CardLayout = styled.div<{ $src: string }>`
  cursor: pointer;
  display: inline-block;
  position: relative;
  width: 192.25px;
  height: 354.5px;

  .front,
  .back {
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    border-radius: 10px;
    transition: all 0.8s ease-out;
  }
  
  .front {
    contain: content;
    padding: 7px;
    background: #000000;
    background-image: url(${(props) => props.$src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
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

  &.clicked, &.not-clicked {
    &[data-aos^="fade"][data-aos^="fade"] {
      opacity: 1; !important
    }
  
    &[data-aos=fade-up] {
      transform: translate3d(0, 0, 0); !important;
    }
  }

  &.clicked,
  &:hover {
    .front {
      opacity: 1;
      transform: rotateY(-180deg);
      z-index: -2;
    }

    .back {
      opacity: 1;
      transform: rotateY(0deg);
      z-index: 0;
    }
  }
`;

const CardComponent = (props: CardProps) => {
  const { data, text, canvasInfo } = props;
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<LinearDataCanvasHandle | null>(null);
  const [clicked, setClicked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !layoutRef.current) return;

    const myResize = debounce(() => {
      const width = (layoutRef.current?.clientWidth as number) - 14;
      const height = (layoutRef.current?.clientHeight as number) - 14;
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
      $src={background_archive}
      data-aos="fade-up"
      data-aos-delay="50"
      data-aos-anchor="bottom"
      data-aos-once="true"
      className={clicked === null ? "" : clicked ? "clicked" : "not-clicked"}
      onClick={() => {
        setClicked((v) => {
          return v === null ? true : !v;
        });
      }}
    >
      <div className="front">
        <LinearDataCanvas ref={canvasRef} />
      </div>
      <div className="back p-5">
        <Scrollbars style={{ width: "100%", height: "100%" }}>
          <p className="w-full h-full">{text}</p>
        </Scrollbars>
      </div>
    </CardLayout>
  );
};

function cardPropsAreEqual(prev: CardProps, next: CardProps) {
  return prev.data === next.data;
}

export default React.memo(CardComponent, cardPropsAreEqual);
