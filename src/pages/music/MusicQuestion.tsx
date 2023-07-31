import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import LineDiv from "../../components/LineDiv";

import { questionList, questionType } from "../../js/Data";

const LayoutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const CardLayout = styled.div`
  width: 1130px;
  padding: 120px 0;
  margin: 0 auto;
`;

const QuestionCard = styled.div`
  cursor: pointer;
  width: 180px;
  height: 250px;
  display: inline-block;
  background: #ffffff;
  transition: all 0.3s ease-out;

  &:not(:last-child) {
    margin-right: 10px;
  }

  p {
    color: #000000;
    font-size: 14px;
    text-align: center;
  }

  &:hover {
    transform: translateY(-20px);
  }
`;

export default function MusicQuestion() {
  const [level, setLevel] = useState(-1);
  const [question, setQuestion] = useState<questionType | null>(null);
  const navigate = useNavigate();

  const handleButton = useCallback(() => {
    if (level > questionList.length - 1) {
      navigate("/music/result");
    } else {
      setLevel((v) => v + 1);
    }
  }, [level, navigate]);

  useEffect(() => {
    setQuestion(questionList[level]);
  }, [level]);

  return (
    <div className="content">
      {level < 0 && (
        <LayoutCenter>
          <LineDiv left={{ text: "당신의 대답을 들려주세요" }} right={{ text: "0" }} />
          <LineDiv left={{ text: "당신만의 음악으로 답해드립니다." }} right={{ text: "." }} />
        </LayoutCenter>
      )}
      {question && (
        <>
          <LineDiv left={{ text: question.question[0] }} right={{ text: String(question.id) }} />
          <LineDiv left={{ text: question.question[1] }} right={{ text: "." }} />
          <CardLayout>
            {question.answerList.map((answer, idx) => {
              return (
                <QuestionCard key={idx}>
                  <p>{answer}</p>
                </QuestionCard>
              );
            })}
          </CardLayout>
        </>
      )}
      {level > questionList.length - 1 && (
        <LayoutCenter>
          <LineDiv left={{ text: "답변이 도착했습니다." }} right={{ text: "0" }} />
          <LineDiv left={{ text: "당신의 선택으로 만들어진 곡입니다." }} right={{ text: "." }} />
        </LayoutCenter>
      )}
      <div className="footer">
        <button onClick={handleButton}>넘어가기</button>
      </div>
    </div>
  );
}
