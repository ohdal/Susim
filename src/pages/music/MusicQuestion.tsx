import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import background_card from "../../assets/images/background_card.png";

import { questionList, questionType } from "../../constant/Data";

const ContentInner = styled.div`
  width: inherit;
  height: inherit;
  position: relative;
  z-index: 2;
`;

const CardLayout = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  margin: 0 auto;
`;

const QuestionImgCard = styled.img<{ $count: number }>`
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

const QuestionCard = styled.div<{ $count: number }>`
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

  const handleCard = useCallback((v: number) => {
    setUserChoice(v);
  }, []);

  const handleButton = useCallback(() => {
    if (!userChoice) {
      alert("카드 중 하나를 선택해주세요.");
    } else {
      userChoiceList.push(userChoice);
      setUserChoice(null);
      setLevel((v) => v + 1);
    }
  }, [userChoice]);

  useEffect(() => {
    setQuestion(questionList[level]);

    if (level > questionList.length - 1) {
      navigate(`/main/${userChoiceList.join("")}`);
    }
  }, [level, navigate]);

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
            <CardLayout>
              {question.answerList.map((answer, idx) => {
                if (question.answerType === "text") {
                  return (
                    <QuestionCard
                      key={idx}
                      $count={question.answerList.length}
                      className={idx + 1 === userChoice ? "selected" : ""}
                      onClick={() => {
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
                      width="100%"
                      key={idx}
                      src={answer}
                      $count={question.answerList.length}
                      className={idx + 1 === userChoice ? "selected" : ""}
                      onClick={() => {
                        handleCard(idx + 1);
                      }}
                    />
                  );
              })}
            </CardLayout>
          </>
        )}
        <div className="footer">
          <button className="gradient-btn" onClick={handleButton}>
            넘어가기
          </button>
        </div>
      </ContentInner>
    </div>
  );
}
