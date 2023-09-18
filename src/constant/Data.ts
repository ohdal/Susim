import * as cardImg from "../assets/images/card";
import * as musicFile from "../assets/media";

const card = cardImg.default;
const music = musicFile.default;

export type questionType = {
  id: number;
  question: string;
  answerType: string;
  answerList: string[];
};

export const questionList: questionType[] = [
  {
    id: 1,
    // question: ["수심을 떠올리면", "어떤 감정이 드나요?"],
    question: "1. 수심을 떠올리면 어떤 감정이 드나요?",
    answerType: "text",
    answerList: ["슬픔", "걱정", "두려움", "혼란", "화", "불쾌"],
  },
  {
    id: 2,
    question: "2. 하루 중 수심을 가장 많이 생각할 때는?",
    answerType: "text",
    answerList: ["아침", "오후", "저녁", "밤", "새벽", "가끔"],
  },
  {
    id: 3,
    question: "3. 나의 수심을 물로 표현한다면 어떤 형태 또는 소리를 띄고 있나요?",
    answerType: "text",
    answerList: ["고여있는", "똑똑떨어진", "졸졸흐르는", "쏟아지는", "잔잔한", "파도치는"],
  },
  {
    id: 4,
    question: "4. 수심은 내 삶에 어떤 영향을 미치고 있나요?",
    answerType: "text",
    answerList: ["건강", "수면", "생활", "관계", "기분", "시간"],
  },
  {
    id: 5,
    question: "5. 스스로의 안정을 위해 이미지를 하나 고른다면?",
    answerType: "img",
    answerList: [card.Q5_1, card.Q5_2, card.Q5_3, card.Q5_4, card.Q5_5, card.Q5_6],
  },
];

export const musicFileList = [
  [music.Q1_1, music.Q1_2, music.Q1_3, music.Q1_4, music.Q1_5, music.Q1_6],
  [music.Q2_1, music.Q2_2, music.Q2_3, music.Q2_4, music.Q2_5, music.Q2_6],
  [music.Q3_1, music.Q3_2, music.Q3_3, music.Q3_4, music.Q3_5, music.Q3_6],
  [music.Q4_1, music.Q4_2, music.Q4_3, music.Q4_4, music.Q4_5, music.Q4_6],
  [music.Q5_1, music.Q5_2, music.Q5_3, music.Q5_4, music.Q5_5, music.Q5_6],
];

export const canvasFontSize = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
};
