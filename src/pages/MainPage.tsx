import { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import database from "../utils/firebase";
import { push } from "firebase/database";

import MainInput, { MainInputHandle } from "../components/MainInput";
import LinearDataCanvas, { LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import ScatterCanvas from "../components/ScatterCanvas";

const AnimationDiv = styled.div`
  width: 60%;
  min-height: 200px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 1.5s ease-out;

  &.overlay {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const MainP = styled.p`
  text-align: center;
  font-size: 1.625rem;
`;

const MainButton = styled.button`
  float: right;
  padding: 10px 12px;
  margin-right: 10px;
  text-align: center;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);

  &:first-child {
    margin-right: 0;
  }
`;

const text = [
  "당신이 적은 수심은 사라졌습니다.",
  "배수된 감정과 물은 모두 섞여 어딘가로 흘렀습니다.",
  "",
  "하지만, 당신이 수심을 적을때 남긴 숨의 기록은",
  "당신에게 전송되었습니다.",
  "",
  "이 사이트에는 24간 동안은 당신의 수심이 기록되지만,",
  "그 이후에는 영구적으로 삭제됩니다.",
  "",
  "다른이들의 수심을 보고 싶다면 아카이브 버튼을 클릭하세요.",
];

// const AudioContext = window.AudioContext || window.webkitAudioContext;
const AudioContext = window.AudioContext;
let audioCtx: AudioContext;
let bufferLength: number;
let dataArray: Uint8Array;
const MAX_TEXT_SIZE = 200;
const MIN_TEXT_SIZE = 10;

export default function MainPage() {
  const canvasRef = useRef<LinearDataCanvasHandle>(null);
  const susimInputRef = useRef<MainInputHandle>(null);
  const emailInputRef = useRef<MainInputHandle>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [level, setLevel] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const navigate = useNavigate();

  const getDomainData = useCallback(() => {
    if (analyser) analyser.getByteTimeDomainData(dataArray);

    return { bufferLength, dataArray };
  }, [analyser]);

  const getMediaStream = useCallback(async () => {
    try {
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mediaStream) {
        console.log("success get mediastream");
        audioCtx = new AudioContext();

        const analyser = audioCtx.createAnalyser();

        setAnalyser(analyser);

        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        // 마이크로 소리를 받아와 source 생성
        const source = audioCtx.createMediaStreamSource(mediaStream);
        // 해당소스 분석노드와 연결
        source.connect(analyser);
      }
    } catch (err) {
      console.log(`에러발생 ${err as string}`);

      alert("원활한 온라인도우 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요.");
      navigate("/");
    }
  }, [navigate]);

  const validate = useCallback((cur: MainInputHandle | null): { result: boolean; value: string; text: string } => {
    const returnObj = { result: false, value: "", text: "" };
    if (!cur) return returnObj;

    const text = cur.getText();
    const name = cur.name;

    if (!text.trim()) {
      returnObj.text = `${name}을 입력해주세요.`;
      return returnObj;
    } else {
      returnObj.value = text;
    }

    let v;
    const email_reg = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    switch (name) {
      case "수심":
        v = text.length >= MIN_TEXT_SIZE;
        returnObj.result = v;
        returnObj.text = v ? "" : `${MIN_TEXT_SIZE}자 이상 작성해주세요.`;
        break;
      case "이메일":
        v = email_reg.test(text);
        returnObj.result = v;
        returnObj.text = v ? "" : "이메일 형식에 맞게 입력해주세요.";
        break;
      default:
        break;
    }

    return returnObj;
  }, []);

  const handleSusim = useCallback(async () => {
    const { result, value, text } = validate(susimInputRef.current);

    if (result) {
      const linearData = canvasRef.current?.getLinearData();
      setImageData(canvasRef.current?.getImageData() || null);

      if (linearData) {
        const db = database("susims");
        const canvasInfo = { width: linearData.width, height: linearData.height };

        const data = {
          date: new Date().getTime(),
          // date: 1694246986284,
          data: JSON.stringify(linearData.data),
          canvasInfo: JSON.stringify(canvasInfo),
          text: value,
        };
        const result = await push(db, data);
        console.log("데이터 저장 완료", result);
      } else {
        alert("error, 데이터 가져오기 오류");
      }

      setLevel(1);
    } else {
      alert(text);
    }
  }, [validate]);

  const handleEmail = useCallback(() => {
    const { result, value, text } = validate(emailInputRef.current);

    if (result) {
      // 이메일 전송 하기

      console.log(imageData);
      console.log("이메일 전송 완료", value);

      setLevel(3);
    } else {
      alert(text);
    }
  }, [validate, imageData]);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

  useEffect(() => {
    switch (level) {
      case 0:
        break;
      case 1:
        setTimeout(() => {
          setLevel((v) => v + 1);
        }, 5000);
        break;
      case 2:
        // canvasRef.current?.stopAnimation();
        break;
      case 3:
        setTimeout(() => {
          setLevel((v) => v + 1);
        }, 5000);
        break;
      case 4:
        setIsLast(true);
        break;
    }
  }, [level]);

  return (
    <>
      {isLast ? (
        <ScatterCanvas
          text={text}
          afterAnimationFunc={() => {
            setLevel(0);
            setIsLast(false);
          }}
        />
      ) : (
        <>
          {analyser && <LinearDataCanvas ref={canvasRef} getDomainData={getDomainData} />}
          <div className="w-full h-full relative">
            {level === 2 && (
              <div className="w-full h-full absolute top-0 left-0" style={{ background: "rgba(0,0,0,0.5)" }} />
            )}
            <AnimationDiv style={{ opacity: level === 0 ? 1 : 0, visibility: level === 0 ? "visible" : "hidden" }}>
              <MainP>당신의 수심을 적어주세요</MainP>
              <MainInput
                name="수심"
                ref={susimInputRef}
                max={MAX_TEXT_SIZE}
                visibleCount={true}
                changeEventHandle={(...args) => {
                  const [v] = args;
                  canvasRef.current?.fillUp(v as string);
                }}
              />
              <div>
                <MainButton
                  onClick={() => {
                    void handleSusim();
                  }}
                >
                  전송하기
                </MainButton>
              </div>
            </AnimationDiv>
            <AnimationDiv style={{ opacity: level === 2 ? 1 : 0, visibility: level === 2 ? "visible" : "hidden" }}>
              <MainP>당신의 숨의 기록을 전송하시겠습니까 ?</MainP>
              <MainInput name="이메일" ref={emailInputRef} placeholder="이메일을 입력해주세요." visibleCount={false} />
              <div>
                <MainButton
                  onClick={() => {
                    setLevel(3);
                  }}
                >
                  아니요
                </MainButton>
                <MainButton onClick={handleEmail}>전송하기</MainButton>
              </div>
            </AnimationDiv>
            {level === 0 && (
              <button
                className="fixed right-4 bottom-4"
                onClick={() => {
                  navigate("archive");
                }}
              >
                Go Archive
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
