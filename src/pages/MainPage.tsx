import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getMediaStream = useCallback(async () => {
    // const AudioContext = window.AudioContext || window.webkitAudioContext;
    const AudioContext = window.AudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    let mediaStream = null;

    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
    // 마이크 MediaStream 취득(audio를 true로 설정)
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioRef.current && mediaStream) {
        // 마이크에서 입력받은 MediaStream으로 오디오 재생
        audioRef.current.srcObject = mediaStream;

        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        // 데이터 시각화...
      }
      /* use the stream */
    } catch (err) {
      console.error(`에러 발생: ${String(err)}`);
    }
  }, []);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

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
