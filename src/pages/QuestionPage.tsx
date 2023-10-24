import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import background_card from "../assets/images/background_card.png";

import { SpeechContext } from "../contexts/speechContext";
import { questionList, questionType } from "../constants/Data";

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
  const [question, setQuestion] = useState<questionType | null>(null);
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const navigate = useNavigate();
  const speechService = useContext(SpeechContext);

  const handleCard = useCallback(
    (v: number) => {
      if (speechService.synth.isSpeaking) return;

      setUserChoice(v);
    },
    [speechService]
  );

  const handleButton = useCallback(() => {
    if (speechService.synth.isSpeaking) return;

    if (!userChoice) {
      if (speechService.tts)
        speechService.synth.speak("카드 중 하나를 클릭하여 선택한 뒤, 넘어가기 버튼을 클릭해주세요.", {
          blocking: true,
        });
      else alert("카드 중 하나를 선택해주세요.");
    } else {
      if (speechService.tts) {
        speechService.synth.speak("클릭");
        speechService.synth.isSpeaking = true;
      }
      userChoiceList.push(userChoice);
      setUserChoice(null);
      setLevel((v) => v + 1);
    }
  }, [userChoice, speechService]);

  const handleSynthSub = useCallback(
    (text: string) => {
      if (speechService.tts) {
        speechService.synth.speak(text);
      }
    },
    [speechService]
  );

  useEffect(() => {
    const question = questionList[level];
    setQuestion(question);

    if (level > questionList.length - 1) {
      if (speechService.tts) speechService.synth.isSpeaking = false;
      navigate(`/main/${userChoiceList.join("")}`);
    } else {
      if (speechService.tts) {
        speechService.synth.speak(question.ttsText, {
          blocking: true,
          forced: true,
        });
      }
    }
  }, [level, navigate, speechService]);

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
