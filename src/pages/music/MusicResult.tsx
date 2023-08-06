import { Link } from "react-router-dom";
import LineDiv from "../../components/LineDiv";
import styled from "styled-components";

import background_img_1 from "../../assets/images/background_1.png";

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
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
`;

export default function MusicResult() {
  return (
    <>
      <div className="content">
        <BackgroundDiv $background={background_img_1} />
        <LineDiv left={{ text: "5 questioins." }} right={{ text: "08.07" }} />
        <LineDiv left={{ text: "Give me your own answer", size: 1 }} right={{ text: "08.11" }} />
        <BottomText className="w-full">
          <LineDiv left={{ text: "답변이 끝났습니다." }} right={{ text: "0" }} />
          <LineDiv left={{ text: "수심 적기를 정리하고 부스 밖으로 나와주세요." }} right={{ text: "." }} />
        </BottomText>
      </div>
      <div className="footer">
        {/* <Link to="/music">.</Link> */}
        <Link to="/">.</Link>
      </div>
    </>
  );
}
