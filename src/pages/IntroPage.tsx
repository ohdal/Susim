import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ScatterCanvas from "../components/ScatterCanvas";

const text = [
  ["여기는 각자의 수심을 적는 웹페이지 입니다.", "", "당신의 수심을 적어주세요."],
  ["당신이 불안을 적는 동안 쉰 숨의 기록은 가시화되어", "", "삶의 역동성으로 기록됩니다."],
  ["수심이 차오르고 개개인의 수심이 모여 연결됩니다.", "", "그러다 한곳으로 흘러 들어가는 경험을 하게 됩니다."],
  ["반드시 마이크 사용 가능한 환경을 준비해주세요."],
  ["수심을 적을때 당신만의 음악을 들려드립니다."],
  ["다섯가지 질문에 당신의 대답을 들려주세요.", "", "음악으로 답해드립니다."],
];

export default function IntroPage() {
  const [level, setLevel] = useState(0);
  const navigate = useNavigate();

  const afterFunc = useCallback(() => {
    if (level < text.length - 1) {
      setLevel(level + 1);
    } else navigate("/question");
  }, [level, navigate]);

  return (
    <div className="w-full h-full background-img">
      <ScatterCanvas text={text[level]} afterAnimationFunc={afterFunc} />
    </div>
  );
}
