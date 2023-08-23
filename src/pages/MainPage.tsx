import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import LinearDataCanvas from "../components/LinearDataCanvas";

// const AudioContext = window.AudioContext || window.webkitAudioContext;
const AudioContext = window.AudioContext;
let audioCtx: AudioContext;
let bufferLength: number;
let dataArray: Uint8Array;

export default function MainPage() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const navigate = useNavigate();

  const getDomainData = useCallback(() => {
    if (analyser) analyser.getByteTimeDomainData(dataArray);

    return { bufferLength, dataArray };
  }, [analyser]);

  const getMediaStream = useCallback(async () => {
    try {
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mediaStream) {
        console.log("success get mediastream");
        audioCtx = new AudioContext();

        const analyser = audioCtx.createAnalyser();
        // const distortion = audioCtx.createWaveShaper();

        setAnalyser(analyser);

        // const makeDistortionCurve = (amount: number) => {
        //   const k = typeof amount === "number" ? amount : 50;
        //   const n_samples = 44100;
        //   const curve = new Float32Array(n_samples);
        //   const deg = Math.PI / 180;
        //   let i = 0;
        //   let x;
        //   for (; i < n_samples; ++i) {
        //     x = (i * 2) / n_samples - 1;
        //     curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        //   }
        //   return curve;
        // };

        // distortion.curve = makeDistortionCurve(50);

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        // 마이크로 소리를 받아와 source 생성
        const source = audioCtx.createMediaStreamSource(mediaStream);
        // 해당소스 분석노드와 연결
        source.connect(analyser);
      }
    } catch (err) {
      console.log(`에러발생 ${err as string}`);

      alert("원활한 온라인전시 진행을 위해, 웹 브라우저 설정화면에서 마이크 사용 권한을 허용해주세요.");
      location.href = "/";
    }
  }, []);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

  return (
    <div>
      {analyser && <LinearDataCanvas getDomainData={getDomainData} />}
      {/* <button
        onClick={() => {
          navigate("/archive");
        }}
      >
        Go Archive
      </button> */}
    </div>
  );
}
