import { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
`;

const MyTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  max-height: 200px;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  margin: 12px 0;
  outline: none;
`;

const MyInput = styled.input`
  width: 100%;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  margin: 12px 0;
  outline: none;
`;

const MyButton = styled.button`
  padding: 10px 12px;
  text-align: center;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);
  float: right;
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

export default function MainPage() {
  const canvasRef = useRef<LinearDataCanvasHandle>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [level, setLevel] = useState(0);
  const [isLast, setIsLast] = useState(false);
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

        analyser.fftSize = 256;
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

      alert("원활한 온라인전시 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요.");
      location.href = "/";
    }
  }, []);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

  useEffect(() => {
    switch (level) {
      case 0:
        break;
      case 1:
        setTimeout(() => {
          canvasRef.current?.stopAnimation();
          setLevel((v) => v + 1);
        }, 5000);
        break;
      case 2:
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

  useEffect(() => {
    const myResize = () => {
      if (level === 2) {
        canvasRef?.current?.currentDraw();
      }
    };

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
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
            <AnimationDiv style={{ opacity: level === 0 ? 1 : 0, visibility: level === 0 ? "visible" : "hidden" }}>
              <p className="text-center">당신의 수심을 적어주세요</p>
              <MyTextarea />
              <MyButton
                onClick={() => {
                  setLevel(1);
                }}
              >
                전송하기
              </MyButton>
            </AnimationDiv>
            <AnimationDiv style={{ opacity: level === 2 ? 1 : 0, visibility: level === 2 ? "visible" : "hidden" }}>
              <p className="text-center">당신의 숨의 기록을 전송하시겠습니까 ?</p>
              <MyInput placeholder="이메일을 입력해주세요." />
              <MyButton
                onClick={() => {
                  setLevel(3);
                }}
              >
                아니요
              </MyButton>
              <MyButton>전송하기</MyButton>
            </AnimationDiv>
            {level === 0 && (
              <button
                className="fixed right-4 bottom-4"
                onClick={() => {
                  navigate("/archive");
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
