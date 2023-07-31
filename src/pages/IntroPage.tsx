import ScatterCanvas from "../components/ScatterCanvas";

const text = [
  "여기는 각자의 수심을 적는 웹페이지 입니다.",
  "당신의 수심을 적어주세요",
  "",
  "당신이 불안을 적는 동안 쉰 숨의 기록은 가시화되어 삶의 역동성으로 기록됩니다.",
  "",
  "수심이 차오르고 개개인의 수심이 모여 연결됩니다.",
  "그러다 한곳으로 흘러 들어가는 경험을 하게 됩니다.",
  "",
  "반드시 마이크 사용 가능한 환경을 준비해주세요",
];

export default function IntroPage() {
  return (
    <>
      <ScatterCanvas text={text} />
    </>
  );
}
