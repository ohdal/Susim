export type questionType = {
  id: number;
  question: string[];
  answerList: string[];
};

export const questionList: questionType[] = [
  {
    id: 1,
    question: ["수심을 떠올리면", "어떤 감정이 드나요?"],
    answerList: ["슬픔", "걱정", "두려움", "혼란", "화", "불쾌"],
  },
  {
    id: 2,
    question: ["하루 중 수심을 가장", "많이 생각할 때는?"],
    answerList: ["아침", "오후", "저녁", "밤", "새벽", "가끔"],
  },
  {
    id: 3,
    question: ["나의 수심을 물로 표현한다면", "어떤 형태 또는 소리를 띄고 있나요?"],
    answerList: ["고여 있는", "똑똑 떨어진", "졸졸 흐르는", "쏟아지는", "파도치는", "잔잔한"],
  },
  {
    id: 4,
    question: ["수심은 내 삶에 어떤 영향을", "미치고 있나요?"],
    answerList: ["건강", "수면", "생활", "관계", "기분", "시간"],
  },
  {
    id: 5,
    question: ["스스로의 안정을 위해 이미지를", "하나 고른다면?"],
    answerList: ["슬픔", "걱정", "두려움", "혼란", "화", "불쾌"],
  },
];
