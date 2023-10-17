import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import background_card from "../../assets/images/background_card.png";

import { ServiceContext, mySynth } from "../../utils/speechService";
import { questionList, questionType } from "../../constant/Data";

const ContentInner = styled.div`
  width: inherit;
  height: inherit;
  position: relative;
  z-index: 2;
`;

const CardLayout = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const QuestionImgCard = styled.button<{ $count: number }>`
  width: ${(props) => (100 - (props.$count - 1) * 2) / props.$count}%;
  cursor: pointer;
  border-radius: 10px;
  display: inline-block;
  transition: all 0.3s ease-out;
  // box-shadow: 3px 3px 0px 3px #7c7c7c;

  &:not(:last-child) {
    margin-right: 2%;
  }

  &:hover,
  &.selected {
    transform: translateY(-30px);
  }
`;

const QuestionCard = styled.button<{ $count: number }>`
  cursor: pointer;
  position: relative;
  width: ${(props) => (100 - (props.$count - 1) * 2) / props.$count}%;
  display: inline-block;
  border-radius: 10px;
  transition: all 0.3s ease-out;

  &:not(:last-child) {
    margin-right: 2%;
  }

  p {
    position: absolute;
    top: 43%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    font-size: 1.375rem; // 22px
    font-weight: bold;
    text-align: center;
    // line-height: 16.25rem;
  }

  &:hover,
  &.selected {
    transform: translateY(-30px);
  }
`;

const QuestionP = styled.p`
  padding-top: 6.25rem; // 100px
  text-align: center;
  font-size: 1.625rem;
`;

let userChoiceList: number[] = [];
export default function MusicQuestion() {
  const [level, setLevel] = useState(0);
  const [questionSpeak, setQuestionSpeak] = useState(false);
  const [question, setQuestion] = useState<questionType | null>(null);
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const navigate = useNavigate();
  const service = useContext(ServiceContext);

  const handleCard = useCallback(
    (v: number) => {
      if (questionSpeak) return;

      setUserChoice(v);
    },
    [questionSpeak]
  );

  const handleButton = useCallback(() => {
    if (questionSpeak) return;

    if (!userChoice) {
      if (service.tts)
        mySynth.speak("카드 중 하나를 클릭하여 선택한 뒤, 넘어가기 버튼을 클릭해주세요.", {
          end: () => {
            setQuestionSpeak(false);
          },
          start: () => {
            setQuestionSpeak(true);
          },
        });
      else alert("카드 중 하나를 선택해주세요.");
    } else {
      if (service.tts) mySynth.speak("클릭");
      userChoiceList.push(userChoice);
      setUserChoice(null);
      setLevel((v) => v + 1);
    }
  }, [userChoice, service, questionSpeak]);

  const handleSynthSub = useCallback(
    (text: string) => {
      if (service.tts && !questionSpeak) {
        mySynth.speak(text);
      }
    },
    [service, questionSpeak]
  );

  useEffect(() => {
    const question = questionList[level];
    setQuestion(question);

    if (level > questionList.length - 1) {
      navigate(`/main/${userChoiceList.join("")}`);
    } else {
      // if (service.tts) {
      //   mySynth.speak(question.ttsText, {
      //     end: () => {
      //       setQuestionSpeak(false);
      //     },
      //     start: () => {
      //       setQuestionSpeak(true);
      //     },
      //   });
      // }
    }
  }, [level, navigate, service]);

  useEffect(() => {
    return () => {
      userChoiceList = [];
    };
  }, []);

  return (
    <div className="content background-img">
      <ContentInner>
        {question && (
          <>
            <QuestionP>{question.question}</QuestionP>
            <CardLayout className="align-center">
              {question.answerList.map((answer, idx) => {
                if (question.answerType === "text") {
                  return (
                    <QuestionCard
                      key={idx}
                      $count={question.answerList.length}
                      className={idx + 1 === userChoice ? "selected" : ""}
                      onFocus={() => {
                        handleSynthSub(answer + "카드");
                      }}
                      onClick={() => {
                        handleSynthSub("선택");
                        handleCard(idx + 1);
                      }}
                    >
                      <img width="100%" src={background_card} />
                      <p>{answer}</p>
                    </QuestionCard>
                  );
                } else
                  return (
                    <QuestionImgCard
                      key={idx}
                      $count={question.answerList.length}
                      className={idx + 1 === userChoice ? "selected" : ""}
                      onFocus={() => {
                        if (question.ttsAnswer) handleSynthSub(question.ttsAnswer[idx] + "카드");
                      }}
                      onClick={() => {
                        if (question.ttsAnswer) handleSynthSub("선택");
                        handleCard(idx + 1);
                      }}
                    >
                      <img width="100%" src={answer} />
                    </QuestionImgCard>
                  );
              })}
            </CardLayout>
          </>
        )}

        <div className="footer">
          <button
            className="gradient-btn"
            onClick={() => {
              handleButton();
            }}
            onFocus={() => {
              handleSynthSub("넘어가기 버튼");
            }}
          >
            넘어가기
          </button>
        </div>
      </ContentInner>
    </div>
  );
}
