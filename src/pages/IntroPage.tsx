import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "../utils";
import { canvasFontSize } from "../constant/Data";
import { ServiceContext, mySynth } from "../utils/speechService";
import ScatterCanvas from "../components/ScatterCanvas";

const text = [
  ["여기는 각자의 수심을 적는 웹페이지 입니다.", "", "당신의 수심을 적어주세요."],
  ["당신이 불안을 적는 동안 쉰 숨의 기록은 가시화되어", "", "삶의 역동성으로 기록됩니다."],
  ["수심이 차오르고 개개인의 수심이 모여 연결됩니다.", "", "그러다 한곳으로 흘러 들어가는 경험을 하게 됩니다."],
  ["반드시 마이크 사용 가능한 환경을 준비해주세요."],
  ["수심을 적을때 당신만의 음악을 들려드립니다."],
  ["다섯가지 질문에 당신의 대답을 들려주세요.", "", "음악으로 답해드립니다."],
];

type Props = { level: number; endFunc: (value?: number) => void };
const ServiceLayout = (props: Props) => {
  const { level, endFunc } = props;
  const [fontSize, setFontSize] = useState(canvasFontSize(window.innerWidth));

  useEffect(() => {
    const myResize = debounce(() => {
      setFontSize(canvasFontSize(window.innerWidth));
    }, 300);

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
  }, []);

  useEffect(() => {
    mySynth.speak(text[level].join(""), {
      end: () => {
        endFunc(level + 1);
      },
    });
  }, [endFunc, level]);

  return (
    <div className="text-center align-center">
      {text[level].map((v, idx) => {
        if (v)
          return (
            <p
              key={`${level}-${idx}`}
              className="last:mb-0"
              style={{ fontSize: `${fontSize}px`, marginBottom: "10px" }}
            >
              {v}
            </p>
          );
      })}
    </div>
  );
};

export default function IntroPage() {
  const [level, setLevel] = useState(0);
  const navigate = useNavigate();
  const service = useContext(ServiceContext);

  const afterFunc = useCallback(
    (value?: number) => {
      if (level < text.length - 1) {
        if (value) setLevel(value);
        else setLevel((v) => (v += 1));
      } else navigate("/question");
    },
    [level, navigate]
  );

  return (
    <div className="w-full h-full background-img">
      {service.tts ? (
        <ServiceLayout level={level} endFunc={afterFunc} />
      ) : (
        <ScatterCanvas text={text[level]} afterAnimationFunc={afterFunc} />
      )}
    </div>
  );
}
