import { useEffect, useCallback, useState, useRef, useContext } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { ContextType } from "../layouts/MusicLayout";
import styled from "styled-components";

import emailjs from "@emailjs/browser";
const { VITE_EMAIL_SERVICE_ID, VITE_EMAIL_TEMPLATE_ID, VITE_EMAIL_PUBLIC_KEY } = import.meta.env;

import { susim } from "../constant/Susim.ts";
import database from "../utils/firebase";
import { push, get, query, orderByChild, limitToLast } from "firebase/database";

import { canvasFontSize } from "../constant/Data.ts";
import { ServiceContext, mySynth } from "../utils/speechService.ts";
import MainInput, { MainInputHandle } from "../components/MainInput";
import LinearDataCanvas, { LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import ScatterCanvas from "../components/ScatterCanvas";
import { debounce } from "../utils/index.ts";

const AnimationDiv = styled.div`
  width: 60%;
  min-height: 200px;
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
    "이 사이트에는 24간 동안 당신의 수심이 기록되지만,",
    "그 이후에는 영구적으로 삭제됩니다.",
    "",
    "다른이들의 수심을 보고 싶다면 아카이브 버튼을 클릭하세요.",
  ],
];

const handleSynsthInput = debounce((text: string, event: { end: () => void; start: () => void }) => {
  mySynth.speak(text, event);
}, 500);

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
let errorCount = 0;

export default function MainPage() {
  const canvasRef = useRef<LinearDataCanvasHandle>(null);
  const susimInputRef = useRef<MainInputHandle>(null);
  const emailInputRef = useRef<MainInputHandle>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [synthSpeak, setSynthSpeak] = useState(false);
  const [level, setLevel] = useState(0);
  const [textLevel, setTextLevel] = useState(0);
  const [imageData, setImageData] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const service = useContext(ServiceContext);

  const { musicPause, musicPlay } = useOutletContext<ContextType>();

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

  const getDefaultSynthEvent = useCallback((): { end: () => void; start: () => void } => {
    return {
      end: () => {
        setSynthSpeak(false);
      },
      start: () => {
        setSynthSpeak(true);
      },
    };
  }, []);

  const handleSusim = useCallback(async () => {
    const { result, value, text } = validate(susimInputRef.current);

    if (result) {
      canvasRef.current?.stopAnimation();
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
      if (service.tts)
        mySynth.speak(text, {
          end: () => {
            susimInputRef.current?.focus();
          },
        });
      else alert(text);
    }
  }, [validate, service]);

  const handleEmail = useCallback(() => {
    const { result, value, text } = validate(emailInputRef.current);

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
      if (service.tts)
        mySynth.speak(text, {
          end: () => {
            emailInputRef.current?.focus();
          },
        });
      else alert(text);
    }
  }, [validate, imageData, service]);

  const handleText = useCallback(() => {
    switch (textLevel) {
      case 1:
        if (service.tts)
          mySynth.speak("답변이 도착했습니다. 당신의 선택으로 만들어진 곡입니다.", {
            end: () => {
              setLevel((v) => v + 1);
            },
          });
        else setLevel((v) => v + 1);
        break;
      case 2:
        if (service.tts)
          mySynth.speak(
            "당신이 적은 수심은 사라졌습니다. 배수된 감정과 물은 모두 섞여 어딘가로 흘렀습니다. 하지만, 당신이 수심을 적을때 남긴 숨의 기록은 당신에게 전송되었습니다.",
            {
              end: () => {
                setLevel((v) => v + 1);
              },
            }
          );
        else setLevel((v) => v + 1);
        break;
      case 3:
        if (service.tts)
          mySynth.speak(
            "이 사이트에는 24시간 동안은 당신의 수심이 기록되지만, 그 이후에는 영구적으로 삭제됩니다. 다른이들의 수심을 보고 싶다면 아카아브 버튼을 클릭하세요. ",
            {
              end: () => {
                setLevel(1);
                musicPlay();
              },
            }
          );
        else {
          setLevel(1);
          musicPlay();
        }
        break;
    }
  }, [textLevel, musicPlay, service]);

  const handleInput = useCallback(
    (v: string) => {
      if (service.tts) {
        if (synthSpeak) {
          mySynth.cancel();
          setSynthSpeak(false);
        } else {
          handleSynsthInput(v, getDefaultSynthEvent());
        }
      }
      canvasRef.current?.fillUp(v);
    },
    [service, synthSpeak, getDefaultSynthEvent]
  );

  const getMediaStream = useCallback(async () => {
    try {
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mediaStream) {
        if (service.tts && textLevel > 0) {
          handleText();
        }

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
      errorCount++;
      console.log(`에러발생 ${err as string}`);

      if (errorCount > 1) return;

      if (service.tts) {
        mySynth.speak(
          "원활한 온라인도우 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요. 카드 선택 화면으로 돌아갑니다.",
          {
            end: () => {
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

    return () => {
      errorCount = 0;
    };
  }, [navigate, service, handleText, textLevel, musicPause]);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

  useEffect(() => {
    switch (level) {
      case 0:
        if (location.state === "archive") setLevel(1);
        else setTextLevel(1);
        break;
      case 1:
        setTextLevel(0);

        if (service.tts)
          mySynth.speak(
            "당신의 수심을 적어주세요. 중앙에 수심을 적는 바. 바 우측 하단에 전송하기. 페이지 우측 하단에 고 아카이브. ",
            getDefaultSynthEvent()
          );
        break;
      case 2:
        setTimeout(() => {
          setLevel((v) => v + 1);
        }, 2000);
        break;
      case 3:
        if (service.tts)
          mySynth.speak(
            "당신의 숨의 기록이 나타난다. 당신의 숨의 기록을 전송하시겠습니까? 중앙에 이메일을 입력하는 바. 바 우측하단 좌측에 전송하기, 우측에 아니요. ",
            getDefaultSynthEvent()
          );
        break;
      case 4:
        getLastSusim()
          .then((result) => {
            if (result) {
              canvasRef.current?.mergeAnimation(result.data, result.canvasInfo, () => {
                setLevel((v) => v + 1);
              });
            } else {
              canvasRef.current?.mergeAnimation(susim.data, susim.canvasInfo, () => {
                setLevel((v) => v + 1);
              });
            }

            if (service.tts)
              mySynth.speak("25초 동안 당신의 숨의 기록과 웹페이지를 이용한 이전 사람들의 기록이 섞여 나타남.");
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
  }, [level, navigate, location, getLastSusim, service, getDefaultSynthEvent]);

  return (
    <>
      {textLevel ? (
        <div className="w-full h-full background-img">
          {service.tts ? (
            <div className="text-center align-center">
              {text[textLevel - 1].map((v, idx) => {
                if (v)
                  return (
                    <p
                      key={`${textLevel}-${idx}`}
                      className="last:mb-0"
                      style={{ fontSize: `${canvasFontSize(window.innerWidth)}px`, marginBottom: "10px" }}
                    >
                      {v}
                    </p>
                  );
              })}
            </div>
          ) : (
            <ScatterCanvas text={text[textLevel - 1]} afterAnimationFunc={handleText} />
          )}
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
                mouseEventHandle={() => {
                  if (service.tts && !synthSpeak) mySynth.speak("수심 입력 바. 클릭 후 수심을 적어주세요.");
                }}
                blurEventHandle={() => {
                  if (service.tts) mySynth.cancel();
                }}
                changeEventHandle={(...args) => {
                  const [v] = args;
                  handleInput(v as string);
                }}
              />
              <div>
                <MainButton
                  className="gradient-btn px-5 py-2.5"
                  onMouseEnter={() => {
                    if (service.tts && !synthSpeak) mySynth.speak("전송하기 버튼");
                  }}
                  onClick={() => {
                    void handleSusim();
                    musicPause();
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
                mouseEventHandle={() => {
                  if (service.tts && !synthSpeak) mySynth.speak("이메일 입력 바. 클릭 후 이메일을 적어주세요.");
                }}
                blurEventHandle={() => {
                  mySynth.cancel();
                }}
                changeEventHandle={(...args) => {
                  const [v] = args;
                  handleInput(v as string);
                }}
              />
              <div>
                <MainButton
                  className="gradient-btn"
                  onMouseEnter={() => {
                    if (service.tts && !synthSpeak) mySynth.speak("아니요 버튼");
                  }}
                  onClick={() => {
                    setLevel(4);
                  }}
                >
                  아니요
                </MainButton>
                <MainButton
                  className="gradient-btn"
                  onMouseEnter={() => {
                    if (service.tts && !synthSpeak) mySynth.speak("전송하기 버튼");
                  }}
                  onClick={handleEmail}
                >
                  전송하기
                </MainButton>
              </div>
            </AnimationDiv>
            {level === 1 && (
              <button
                className="fixed right-4 bottom-4 gradient-btn"
                onMouseEnter={() => {
                  if (service.tts && !synthSpeak) mySynth.speak("Go Archive 버튼");
                }}
                onClick={() => {
                  if (service.tts) mySynth.cancel();
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
