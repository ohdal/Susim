import React, { useEffect, useState, useRef, useContext } from "react";
import styled from "styled-components";
import { Scrollbars } from "react-custom-scrollbars";

import background_archive from "../assets/images/background_archive.png";

import LinearDataCanvas, { lineGroupType, LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import { debounce } from "../utils";
import { SpeechContext } from "../contexts/speechContext";

type CardProps = {
  data: string;
  canvasInfo: string;
  text: string;
  clickHandler?: () => void;
  focusHandler?: () => void;
};

const CardLayout = styled.button<{ $src: string }>`
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
    background: #000000;
    background-image: url(${(props) => props.$src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  
  .front {
    contain: content;
    padding: 12px 8px;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transform: rotateY(180deg);
    color: #FFFFFF;
    text-align: left;
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
  const { data, text, canvasInfo, focusHandler, clickHandler } = props;
  const layoutRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<LinearDataCanvasHandle | null>(null);
  const [clicked, setClicked] = useState<boolean | null>(null);
  const speechService = useContext(SpeechContext);

  useEffect(() => {
    if (!canvasRef.current || !layoutRef.current) return;

    const myResize = debounce(() => {
      const width = (layoutRef.current?.clientWidth as number) - 16;
      const height = (layoutRef.current?.clientHeight as number) - 24;
      canvasRef.current?.canvasResize(width, height);
      canvasRef.current?.currentDraw(
        JSON.parse(data) as lineGroupType,
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
      onFocus={() => {
        if (focusHandler) focusHandler();
        if (speechService.tts) {
          setClicked(true);
          speechService.synth.speak(text);
        }
      }}
      onBlur={() => {
        if (speechService.tts) setClicked(false);
      }}
      onClick={() => {
        if (clickHandler) clickHandler();
        if (!speechService.tts) {
          setClicked((v) => {
            return v === null ? true : !v;
          });
        }
      }}
    >
      <div className="front">
        <LinearDataCanvas ref={canvasRef} />
      </div>
      <div className="back p-6">
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
