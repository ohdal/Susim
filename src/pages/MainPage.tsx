import { useEffect, useCallback, useState, useRef, useContext } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { ContextType } from "../layouts/MusicLayout";
import styled from "styled-components";

import emailjs from "@emailjs/browser";
const { VITE_EMAIL_SERVICE_ID, VITE_EMAIL_TEMPLATE_ID, VITE_EMAIL_PUBLIC_KEY } = import.meta.env;

import { susim } from "../constants/Susim.ts";
import database from "../services/firebase.ts";
import { push, get, query, orderByChild, limitToLast } from "firebase/database";

import { SpeechContext } from "../contexts/speechContext.ts";
import MainInput, { MainInputHandle } from "../components/MainInput";
import LinearDataCanvas, { LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import ScatterCanvas from "../components/ScatterCanvas";

const AnimationDiv = styled.div`
  width: 60%;
  min-height: 200px;
  transition: all 1.5s ease-out;

  &.overlay {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const SttDiv = styled.div`
  width: 60%;
  position: fixed;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);

  p {
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 1.125rem;
  }
`;

const MainP = styled.p`
  text-align: center;
  font-size: 1.625rem;
`;

const MainButton = styled.button`
  float: right;
  padding: 10px 15px;
  margin-right: 10px;
  text-align: center;
  border: none;

  &:first-child {
    margin-right: 0;
  }
`;

const text = [
  ["답변이 도착했습니다.", "", "당신의 선택으로 만들어진 곡입니다."],
  [
    "당신이 적은 수심은 사라졌습니다.",
    "배수된 감정과 물은 모두 섞여 어딘가로 흘렀습니다.",
    "",
    "하지만, 당신이 수심을 적을때 남긴 숨의 기록은",
    "당신에게 전송되었습니다.",
  ],
  [
    "이 사이트에는 24시간 동안 당신의 수심이 기록되지만,",
    "그 이후에는 영구적으로 삭제됩니다.",
    "",
    "다른이들의 수심을 보고 싶다면 아카이브 버튼을 클릭하세요.",
  ],
];

// const AudioContext = window.AudioContext || window.webkitAudioContext;
type typeSusim = { date: number; data: string; canvasInfo: string; text: string };
const AudioContext = window.AudioContext;
let audioCtx: AudioContext;
let bufferLength: number;
let dataArray: Uint8Array;
const MAX_TEXT_SIZE = 200;
const MIN_TEXT_SIZE = 10;
const db = database("susims");
let userSusim: typeSusim | null = null;

export default function MainPage() {
  const canvasRef = useRef<LinearDataCanvasHandle>(null);
  const susimInputRef = useRef<MainInputHandle>(null);
  const emailInputRef = useRef<MainInputHandle>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [level, setLevel] = useState(0);
  const [textLevel, setTextLevel] = useState(0);
  const [imageData, setImageData] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const speechService = useContext(SpeechContext);

  const { musicPause, musicPlay, getMusicInfo } = useOutletContext<ContextType>();

  const getDomainData = useCallback(() => {
    if (analyser) analyser.getByteTimeDomainData(dataArray);

    return { bufferLength, dataArray };
  }, [analyser]);

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

  const getLastSusim = useCallback(async (): Promise<typeSusim | null> => {
    if (!userSusim) return null;

    const snapshot = await get(query(db, orderByChild("date"), limitToLast(3)));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const arr: typeSusim[] = Object.values(data as object);
      return arr.filter((v) => v.text !== userSusim?.text)[0];
    } else {
      return null;
    }
  }, []);

  const handleSusim = useCallback(async () => {
    const { result, value, text } = validate(susimInputRef.current);

    if (speechService.tts) speechService.synth.speak("클릭");

    if (result) {
      canvasRef.current?.stopAnimation();
      musicPause();
      const linearData = canvasRef.current?.getLinearData();
      setImageData(canvasRef.current?.getImageData() || null);

      if (linearData) {
        const canvasInfo = { width: linearData.width, height: linearData.height };

        const data = {
          date: new Date().getTime(),
          data: JSON.stringify(linearData.data),
          canvasInfo: JSON.stringify(canvasInfo),
          text: value,
        };

        const result = await push(db, data);
        userSusim = data;

        console.log("데이터 저장 완료", result);
      } else {
        alert("error, 데이터 가져오기 오류");
      }

      setLevel(2);
    } else {
      if (speechService.tts)
        speechService.synth.speak(text, {
          endEvent: () => {
            susimInputRef.current?.focus();
          },
        });
      else alert(text);
    }
  }, [validate, speechService, musicPause]);

  const handleEmail = useCallback(() => {
    const { result, value, text } = validate(emailInputRef.current);

    if (speechService.tts) speechService.synth.speak("클릭");

    if (result) {
      emailjs
        .send(
          VITE_EMAIL_SERVICE_ID as string,
          VITE_EMAIL_TEMPLATE_ID as string,
          { user_email: value, content: imageData },
          VITE_EMAIL_PUBLIC_KEY as string
        )
        .then(
          (result) => {
            console.log(result.text);
          },
          (error) => {
            console.error(error.text);
          }
        );

      setLevel(4);
    } else {
      if (speechService.tts)
        speechService.synth.speak(text, {
          endEvent: () => {
            emailInputRef.current?.focus();
          },
        });
      else alert(text);
    }
  }, [validate, imageData, speechService]);

  const handleText = useCallback(() => {
    switch (textLevel) {
      case 1:
        setLevel(1);
        break;
      case 2:
        setLevel(6);
        break;
      case 3:
        setLevel(1);
        musicPlay();
        break;
    }
  }, [textLevel, musicPlay]);

  const getMediaStream = useCallback(async () => {
    try {
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mediaStream) {
        if (speechService.tts) handleText();
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

      if (speechService.tts) {
        speechService.synth.speak(
          "원활한 온라인도우 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요. 카드 선택 화면으로 돌아갑니다.",
          {
            blocking: true,
            endEvent: () => {
              navigate("/question");
            },
          }
        );
      } else {
        alert("원활한 온라인도우 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요.");
        navigate("/question");
      }
      musicPause();
    }
  }, [navigate, speechService, musicPause, handleText]);

  useEffect(() => {
    void getMediaStream();
  }, []);

  useEffect(() => {
    switch (level) {
      case 0:
        if (analyser) {
          if (location.state === "archive") setLevel(1);
          else setTextLevel(1);
        }
        break;
      case 1:
        setTextLevel(0);

        if (speechService.tts)
          speechService.synth.speak(
            "당신의 수심을 적어주세요. 중앙에 수심을 적는 바. 바 우측 하단에 전송하기. 페이지 우측 하단에 고 아카이브. 작성한 수심을 듣고싶으시다면 입력창에서 에프일번키를 눌러주세요.",
            { blocking: true }
          );
        break;
      case 2:
        setTimeout(() => {
          setLevel(3);
        }, 2000);
        break;
      case 3:
        if (speechService.tts)
          speechService.synth.speak(
            "당신의 숨의 기록이 나타난다. 당신의 숨의 기록을 전송하시겠습니까? 중앙에 이메일을 입력하는 바. 바 우측하단 좌측에 전송하기, 우측에 아니요. 작성한 이메일을 듣고싶으시다면 입력창에서 에프일번키를 눌러주세요.",
            { blocking: true }
          );
        break;
      case 4:
        getLastSusim()
          .then((result) => {
            if (result) {
              canvasRef.current?.mergeAnimation(result.data, result.canvasInfo, () => {
                setLevel(5);
              });
            } else {
              canvasRef.current?.mergeAnimation(susim.data, susim.canvasInfo, () => {
                setLevel(5);
              });
            }

            if (speechService.tts)
              speechService.synth.speak(
                "25초 동안 당신의 숨의 기록과 웹페이지를 이용한 이전 사람들의 기록이 섞여 나타남."
              );
          })
          .catch((err) => {
            console.error(err);
          });
        break;
      case 5:
        setTextLevel(2);
        break;
      case 6:
        setTextLevel(3);
        break;
    }
  }, [level, navigate, location, getLastSusim, speechService, analyser]);

  return (
    <>
      {textLevel ? (
        <div className="w-full h-full background-img">
          <ScatterCanvas text={text[textLevel - 1]} afterAnimationFunc={handleText} />
        </div>
      ) : (
        <>
          {analyser && <LinearDataCanvas ref={canvasRef} getDomainData={getDomainData} />}
          <div className="w-full h-full relative">
            {level === 3 && (
              <div className="w-full h-full absolute top-0 left-0" style={{ background: "rgba(0,0,0,0.5)" }} />
            )}
            <AnimationDiv
              className="align-center"
              style={{ opacity: level === 1 ? 1 : 0, visibility: level === 1 ? "visible" : "hidden" }}
            >
              <MainP>당신의 수심을 적어주세요</MainP>
              <MainInput
                name="수심"
                ref={susimInputRef}
                max={MAX_TEXT_SIZE}
                visibleCount={true}
                keydownHandle={(key, text) => {
                  if (speechService.tts && key === "F1") {
                    speechService.synth.speak(text, { blocking: true });
                  }
                }}
                focusHandle={() => {
                  if (speechService.tts) speechService.synth.speak("수심 입력 바");
                }}
                changeEventHandle={(...args) => {
                  const [v] = args;
                  canvasRef.current?.fillUp(v as string);
                }}
              />
              <div>
                <MainButton
                  className="gradient-btn px-5 py-2.5"
                  onFocus={() => {
                    if (speechService.tts) speechService.synth.speak("전송하기 버튼");
                  }}
                  onClick={() => {
                    if (!speechService.tts || (speechService.tts && !speechService.synth.isSpeaking)) {
                      void handleSusim();
                    }
                  }}
                >
                  전송하기
                </MainButton>
              </div>
            </AnimationDiv>
            <AnimationDiv
              className="align-center"
              style={{ opacity: level === 3 ? 1 : 0, visibility: level === 3 ? "visible" : "hidden" }}
            >
              <MainP>당신의 숨의 기록을 전송하시겠습니까 ?</MainP>
              <MainInput
                name="이메일"
                ref={emailInputRef}
                placeholder="이메일을 입력해주세요."
                visibleCount={false}
                keydownHandle={(key, text) => {
                  if (speechService.tts && key === "F1") {
                    speechService.synth.speak(text, { blocking: true });
                  }
                }}
                focusHandle={() => {
                  if (speechService.tts) speechService.synth.speak("이메일 입력 바.");
                }}
                changeEventHandle={(...args) => {
                  const [v] = args;
                  canvasRef.current?.fillUp(v as string);
                }}
              />
              <div>
                <MainButton
                  className="gradient-btn"
                  onFocus={() => {
                    if (speechService.tts) speechService.synth.speak("아니요 버튼");
                  }}
                  onClick={() => {
                    if (speechService.tts) speechService.synth.speak("클릭");
                    if (!speechService.tts || (speechService.tts && !speechService.synth.isSpeaking)) setLevel(4);
                  }}
                >
                  아니요
                </MainButton>
                <MainButton
                  className="gradient-btn"
                  onFocus={() => {
                    if (speechService.tts) speechService.synth.speak("전송하기 버튼");
                  }}
                  onClick={() => {
                    if (!speechService.tts || (speechService.tts && !speechService.synth.isSpeaking)) handleEmail();
                  }}
                >
                  전송하기
                </MainButton>
              </div>
            </AnimationDiv>
            {level === 1 && speechService.stt && (
              <SttDiv>
                <p>{`[${getMusicInfo().join("] [")}]가 합쳐진 음악이 재생되는 중.`}</p>
              </SttDiv>
            )}
            {level === 1 && (
              <button
                className="fixed right-4 bottom-4 gradient-btn"
                onFocus={() => {
                  if (speechService.tts) speechService.synth.speak("Go Archive 버튼");
                }}
                onClick={() => {
                  if (speechService.tts) speechService.synth.speak("클릭");
                  if (!speechService.tts || (speechService.tts && !speechService.synth.isSpeaking))
                    navigate("../archive");
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
