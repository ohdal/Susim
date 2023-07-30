import { Link } from "react-router-dom";
import LineDiv from "../../components/LineDiv";
import styled from "styled-components";

const BottomText = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
`;

export default function MusicResult() {
  return (
    <>
      <div className="content">
        <LineDiv left={{ text: "5 questioins." }} right={{ text: "08.07" }} />
        <LineDiv left={{ text: "Give me yout own answer", size: 16 }} right={{ text: "08.11" }} />
        <BottomText>
          <LineDiv left={{ text: "답변이 끝났습니다." }} right={{ text: "0" }} />
          <LineDiv left={{ text: "수심 적기를 정리하고 부스 밖으로 나와주세요."}} right={{ text: "." }} />
        </BottomText>
      </div>
      <div className="footer">
        <Link to="/">.</Link>
      </div>
    </>
  );
}
