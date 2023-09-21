import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import background_card from "../../assets/images/background_card.png";
// import background_img_2 from "../../assets/images/background_2.png";

import LineDiv from "../../components/LineDiv";

import { questionList, questionType } from "../../constant/Data";

// const BackgroundDiv = styled.div<{ $background: string }>`
//   width: 90%;
//   min-height: 90%;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   background-image: url(${(props) => props.$background});
//   background-position: center;
//   background-size: contain;
//   background-repeat: no-repeat;
//   filter: blur(8px);
//   z-index: 0;
// `;

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
    if (level < 0) {
      userChoiceList = [];
      setLevel((v) => v + 1);
    } else {
      if (!userChoice) {
        alert("카드 중 하나를 선택해주세요.");
      } else {
        userChoiceList.push(userChoice);
        setUserChoice(null);
        setLevel((v) => v + 1);
      }
    }
  }, [level, userChoice]);

  useEffect(() => {
    setQuestion(questionList[level]);

    if (level > questionList.length - 1) {
      navigate(`/main/${userChoiceList.join("")}`);
      // handleMusicList(userChoiceList);
    }
  }, [level, navigate]);

  // useEffect(() => {
  //   setQuestion(questionList[level]);

  //   if (level > questionList.length - 1) {
  //     handleMusicList(userChoiceList);
  //   }
  // }, [level, handleMusicList]);

  // useEffect(() => {
  //   handleMusicList(null);
  // }, [handleMusicList])

  return (
    <div className="content background-img">
      {/* <BackgroundDiv $background={background_img_2} /> */}
      <ContentInner>
        {level < 0 && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full">
              <LineDiv left={{ text: "당신의 대답을 들려주세요" }} right={{ text: "0" }} />
              <LineDiv left={{ text: "당신만의 음악으로 답해드립니다." }} right={{ text: "." }} />
            </div>
          </div>
        )}
        {question && (
          <>
            {/* <LineDiv left={{ text: question.question[0] }} right={{ text: String(question.id) }} /> */}
            {/* <LineDiv left={{ text: question.question[1] }} right={{ text: "." }} /> */}
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
        {level > questionList.length - 1 && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full">
              <LineDiv left={{ text: "답변이 도착했습니다." }} right={{ text: "0" }} />
              <LineDiv left={{ text: "당신의 선택으로 만들어진 곡입니다." }} right={{ text: "." }} />
            </div>
          </div>
        )}
        {level < questionList.length && (
          <div className="footer">
            <button className="gradient-btn" onClick={handleButton}>
              넘어가기
            </button>
          </div>
        )}
      </ContentInner>
    </div>
  );
}
