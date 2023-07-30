import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // const AudioContext = window.AudioContext || window.webkitAudioContext;
    const AudioContext = window.AudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    // 마이크 MediaStream 취득(audio를 true로 설정)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        // Promise이므로 then으로 받아서 사용(async/await를 사용해도 된다.)

        if (audioRef.current) {
          // 마이크에서 입력받은 MediaStream으로 오디오 재생
          audioRef.current.srcObject = mediaStream;

          const source = audioContext.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          // 데이터 시각화...
        }
      })
      .catch((err: string) => {
        console.error(`에러 발생: ${err}`);
      });
  }, []);

  return (
    <div>
      mainPage
      <br />
      <audio ref={audioRef}></audio>
      <button
        onClick={() => {
          navigate("/archive");
        }}
      >
        Go ArchivePage
      </button>
    </div>
  );
}
