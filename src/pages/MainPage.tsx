import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import LinearDataCanvas from "../components/linearDataCanvas";

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
        setAnalyser(analyser);

        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);
      }
    } catch (err) {
      console.log(`에러발생 ${err as string}`);
    }
  }, []);

  useEffect(() => {
    void getMediaStream();
  }, [getMediaStream]);

  return (
    <div>
      {/* <button
        onClick={() => {
          navigate("/archive");
        }}
      >
        Go Archive
      </button> */}
      {analyser && <LinearDataCanvas getDomainData={getDomainData} />}
    </div>
  );
}
