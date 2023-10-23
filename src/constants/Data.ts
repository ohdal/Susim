import * as cardImg from "../assets/images/card";
import * as musicFile from "../assets/media";

const card = cardImg.default;
const music = musicFile.default;

export type questionType = {
  id: number;
  question: string;
  answerType: string;
  answerList: string[];
  ttsAnswer?: string[];
  ttsText: string;
};

export const questionList: questionType[] = [
  {
    id: 1,
    // question: ["수심을 떠올리면", "어떤 감정이 드나요?"],
    question: "1. 수심을 떠올리면 어떤 감정이 드나요?",
    answerType: "text",
    answerList: ["슬픔", "걱정", "두려움", "혼란", "화", "불쾌"],
    ttsText: "1. 수심을 떠올리면 어떤 감정이 드나요? 슬픔 걱정 두려움 혼란 화 불쾌 넘어가기",
  },
  {
    id: 2,
    question: "2. 하루 중 수심을 가장 많이 생각할 때는?",
    answerType: "text",
    answerList: ["아침", "오후", "저녁", "밤", "새벽", "가끔"],
    ttsText: "2. 하루 중 수심을 가장 많이 생각할 때는? 아침 오후 저녁 밤 새벽 가끔 넘어가기",
  },
  {
    id: 3,
    question: "3. 나의 수심을 물로 표현한다면 어떤 형태 또는 소리를 띄고 있나요?",
    answerType: "text",
    answerList: ["고여있는", "똑똑떨어진", "졸졸흐르는", "쏟아지는", "잔잔한", "파도치는"],
    ttsText:
      "3. 나의 수심을 물로 표현한다면 어떤 형태 또는 소리를 띄고 있나요? 고여있는 똑똑떨어진 졸졸흐르는 쏟아지는 잔잔한 파도치는 넘어가기",
  },
  {
    id: 4,
    question: "4. 수심은 내 삶에 어떤 영향을 미치고 있나요?",
    answerType: "text",
    answerList: ["건강", "수면", "생활", "관계", "기분", "시간"],
    ttsText: "4. 수심은 내 삶에 어떤 영향을 미치고 있나요? 건강 수면 생활 관계 기분 시간 넘어가기",
  },
  {
    id: 5,
    question: "5. 스스로의 안정을 위해 이미지를 하나 고른다면?",
    answerType: "img",
    answerList: [card.Q5_1, card.Q5_2, card.Q5_3, card.Q5_4, card.Q5_5, card.Q5_6],
    ttsAnswer: [
      "자잘한 점과 선이 중앙으로 소용돌이 치는듯한 동그란 이미지",
      "점과 선으로 이루어져 있는 파동이 일어나는 동그란 이미지",
      "파동이 일어나는 이미지에 중앙에 흰 동그라미가 있는 동그란 이미지",
      "가운데로 소용돌이 치는 파도가 있는듯한 동그란 이미지",
      "아주 자잘한 점과 선으로 이루어져 있는 파동이 일어나는 동그란 이미지",
      "가운데로 소용돌이 치는 거센 파도가 있는듯한 동그란 이미지",
    ],
    ttsText:
      "5. 스스로의 안정을 위해 이미지를 하나 고른다면? 자잘한 점과 선이 중앙으로 소용돌이 치는듯한 동그란 이미지, 점과 선으로 이루어져 있는 파동이 일어나는 동그란 이미지, 파동이 일어나는 이미지에 중앙에 흰 동그라미가 있는 동그란 이미지, 가운데로 소용돌이 치는 파도가 있는듯한 동그란 이미지,  아주 자잘한 점과 선으로 이루어져 있는 파동이 일어나는 동그란 이미지, 가운데로 소용돌이 치는 거센 파도가 있는듯한 동그란 이미지. 넘어가기",
  },
];

export const musicFileList = [
  [
    { file: music.Q1_1, desc: "낮고 잔잔하며 반복되는 음" },
    { file: music.Q1_2, desc: "어둡고 무거운 음" },
    { file: music.Q1_3, desc: "매우 어둡고 무거운 음의 울림" },
    { file: music.Q1_4, desc: "비규칙적으로 통통튀는 음" },
    { file: music.Q1_5, desc: "어둡게 울리는 소리" },
    { file: music.Q1_6, desc: "매우 어둡고 무거운 음이 잔잔하게 울림" },
  ],
  [
    { file: music.Q2_1, desc: "상승하는 밝은 음" },
    { file: music.Q2_2, desc: "높은 음이 종소리 같이 반복" },
    { file: music.Q2_3, desc: "중간 높이 음으로 이뤄진 화음이 빠르게 반복" },
    { file: music.Q2_4, desc: "화음이 중간 속도로 반복" },
    { file: music.Q2_5, desc: "화음이 비규칙적으로 반복" },
    { file: music.Q2_6, desc: "매우 높은 음이 규칙적으로 반복 " },
  ],
  [
    { file: music.Q3_1, desc: "물 안에 들어간 듯 먹먹한 소리" },
    { file: music.Q3_2, desc: "똑똑 물방울이 떨어지는 소리" },
    { file: music.Q3_3, desc: "시냇물이 졸졸 흐르는 소리" },
    { file: music.Q3_4, desc: "비가 내리는 소리" },
    { file: music.Q3_5, desc: "잔잔하게 큰 물이 흘러가는 소리 " },
    { file: music.Q3_6, desc: "파도치는 소리" },
  ],
  [
    { file: music.Q4_1, desc: "숲속에서 새가 지저귀는 소리" },
    { file: music.Q4_2, desc: "귀뚜라미가 우는 소리" },
    { file: music.Q4_3, desc: "차분한 바람 소리 " },
    { file: music.Q4_4, desc: "키보드 타자 치는 소리" },
    { file: music.Q4_5, desc: "새가 지저귀는 소리와 바람소리" },
    { file: music.Q4_6, desc: "시계 초침 소리" },
  ],
  [
    { file: music.Q5_1, desc: "진동음" },
    { file: music.Q5_2, desc: "바람 소리" },
    { file: music.Q5_3, desc: "강한 바람 소리" },
    { file: music.Q5_4, desc: "스쳐가는 바람 소리" },
    { file: music.Q5_5, desc: "강한 진동음" },
    { file: music.Q5_6, desc: "진동음 들리다 가끔식 끊어지는 소리" },
  ],
];

export const canvasFontSize = (width: number): number => {
  if (width > 1200) {
    return 22;
  } else if (width > 992) {
    return 18;
  } else if (width > 768) {
    return 16;
  } else if (width > 576) {
    return 14;
  } else if (width > 300) {
    return 10;
  } else {
    return 6;
  }
};
