import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ContextType } from "../../layouts/MusicLayout";
import styled from "styled-components";

import background_img_1 from "../../assets/images/background_1.png";

import LineDiv from "../../components/LineDiv";

const BackgroundDiv = styled.div<{ $background: string }>`
  width: 80%;
  min-height: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url(${(props) => props.$background});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const BottomText = styled.div`
  min-width: 360px;
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);

  p {
    margin: 0;
    font-size: 2.625rem; // 42px
    text-align: right;

    &.line {
      position: relative;
      text-align: left;
      padding-right: 10px;

      &::after {
        content: "";
        width: 100px;
        height: 1px;
        background: #ffffff;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
  }
`;

export default function MusicBasic() {
  const { handleMusicList } = useOutletContext<ContextType>();

  useEffect(() => {
    return () => {
      handleMusicList(null);
    };
  }, [handleMusicList]);

  return (
    <>
      <div className="content">
        <BackgroundDiv $background={background_img_1} />
        <LineDiv left={{ text: "5 questioins." }} right={{ text: "08.07" }} />
        <LineDiv left={{ text: "Give me your own answer", size: 1.188 }} right={{ text: "08.11" }} />
        <BottomText>
          <p className="line">다섯가지 질문</p>
          <p>당신의 대답</p>
        </BottomText>
      </div>
      <div className="footer">
        <Link to="question">시작하기</Link>
      </div>
    </>
  );
}
