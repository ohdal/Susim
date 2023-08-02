import * as cardImg from "../assets/images/card";

const card = cardImg.default;

export type questionType = {
  id: number;
  question: string[];
  answerType: string;
  answerList: string[];
};

export const questionList: questionType[] = [
  {
    id: 1,
    question: ["수심을 떠올리면", "어떤 감정이 드나요?"],
    answerType: "img",
    answerList: [card.Q1_1, card.Q1_2, card.Q1_3, card.Q1_4, card.Q1_5, card.Q1_6],
    // answerType: "text",
    // answerList: ["슬픔", "걱정", "두려움", "혼란", "화", "불쾌"],
  },
  {
    id: 2,
    question: ["하루 중 수심을 가장", "많이 생각할 때는?"],
    answerType: "img",
    answerList: [card.Q2_1, card.Q2_2, card.Q2_3, card.Q2_4, card.Q2_5, card.Q2_6],
  },
  {
    id: 3,
    question: ["나의 수심을 물로 표현한다면", "어떤 형태 또는 소리를 띄고 있나요?"],
    answerType: "img",
    answerList: [card.Q3_1, card.Q3_2, card.Q3_3, card.Q3_4, card.Q3_5, card.Q3_6],
  },
  {
    id: 4,
    question: ["수심은 내 삶에 어떤 영향을", "미치고 있나요?"],
    answerType: "img",
    answerList: [card.Q4_1, card.Q4_2, card.Q4_3, card.Q4_4, card.Q4_5, card.Q4_6],
  },
  {
    id: 5,
    question: ["스스로의 안정을 위해 이미지를", "하나 고른다면?"],
    answerType: "img",
    answerList: [card.Q5_1, card.Q5_2, card.Q5_3, card.Q5_4, card.Q5_5, card.Q5_6],
  },
];
