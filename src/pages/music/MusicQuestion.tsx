import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { questionList, questionType } from "../../js/Data";

const QuestionCard = styled.div`
  width: 180px;
  height: 250px;
  display: inline-block;
  background: #ffffff;

  &:not(:last-child) {
    margin-right: 10px;
  }

  p {
    color: #000000;
    font-size: 14px;
    text-align: center;
  }
`;

export default function MusicQuestion() {
  const [level, setLevel] = useState(-1);
  const [question, setQuestion] = useState<questionType | null>(null);
  const navigate = useNavigate();

  const handleButton = useCallback(() => {
    if (level > questionList.length - 1) {
      navigate("/result");
    } else {
      setLevel((v) => v + 1);
    }
  }, [level, navigate]);

  useEffect(() => {
    setQuestion(questionList[level]);
  }, [level]);

  return (
    <div>
      MusicQuestion
      {level < 0 && <div>level -1</div>}
      {question &&
        question.answerList.map((answer, idx) => {
          return (
            <QuestionCard key={idx}>
              <p>{answer}</p>
            </QuestionCard>
          );
        })}
      {level + 1 > questionList.length && <div>end</div>}
      <div className="footer">
        <button onClick={handleButton}>넘어가기</button>
      </div>
    </div>
  );
}
