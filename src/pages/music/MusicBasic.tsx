import { Link, useOutletContext } from "react-router-dom";
import styled from "styled-components";

import LineDiv from "../../components/LineDiv";

const BottomText = styled.div`
  width: 300px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);

  p {
    margin: 0;
    font-size: 36px;
    text-align: right;

    &.line {
      position: relative;
      text-align: left;
      padding-right: 10px;

      &::after {
        content: "";
        width: 120px;
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
  return (
    <>
      <div className="content">
        <LineDiv left={{ text: "5 questioins." }} right={{ text: "08.07" }} />
        <LineDiv left={{ text: "Give me yout own answer", size: 16 }} right={{ text: "08.11" }} />
        <BottomText>
          <p className="line">당신의 수심</p>
          <p>만의 음악</p>
        </BottomText>
      </div>
      <div className="footer">
        <Link to="question">시작하기</Link>
      </div>
    </>
  );
}
