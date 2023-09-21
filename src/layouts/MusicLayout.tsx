import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { musicFileList } from "../constant/Data";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type MusicListType = number[] | null;
export type ContextType = { musicPause: () => void };

let audioList: HTMLAudioElement[] = [];
let loadedCount = 0;
export default function MusicLayout() {
  const navigate = useNavigate();
  const { list } = useParams();

  const handleAllMusic = useCallback((type: boolean) => {
    if (audioList.length > 0) {
      audioList.forEach((audio) => {
        if (type) {
          void audio.play();
        } else {
          audio.pause();
        }
      });

      if (!type) audioList = [];

      loadedCount = 0;
    }
  }, []);

  const loadedEvent = useCallback(() => {
    loadedCount++;
    if (loadedCount === musicFileList.length) {
      console.log("all loaded", audioList);
      handleAllMusic(true);
    }
  }, [handleAllMusic]);

  const musicPlay = useCallback(
    (musicList: MusicListType) => {
      if (musicList) {
        let long = 0;
        const firstMusic = musicList[0] - 1;
        const testAudio = new Audio(musicFileList[0][firstMusic]);

        testAudio.loop = false;
        testAudio
          .play()
          .then(() => {
            testAudio.pause();

            for (let i = 0; i < musicList.length; i++) {
              const num = musicList[i] - 1;
              const audio = new Audio(musicFileList[i][num]);

              audioList.push(audio);
              audio.loop = false;
              audio.onloadeddata = loadedEvent;

              long = audioList[long].duration < audio.duration ? i : long;
            }

            // audioList[long].onended = () => {
            //   navigate("/result");
            // };
          })
          .catch((err) => {
            const errorText = err.toString();
            if (errorText.includes("document first")) {
              alert("카드를 다시 선택해주세요.");
            } else {
              alert("설정에서 해당 브라우저 음악재생을 허용해준 뒤, 다시 카드를 선택해주세요.");
            }
            navigate("/question");
          });
      }
    },
    [loadedEvent, navigate]
  );

  useEffect(() => {
    if (list) {
      const reg = new RegExp("^[0-9]{5}$");
      const result = reg.test(list);
      console.log(result);
      if (result) musicPlay(list.split("").map((v) => Number(v)));
      else {
        alert("잘못된 접근입니다.");
        navigate("/question");
      }
    }

    return () => {
      handleAllMusic(false);
    };
  }, [handleAllMusic, list, musicPlay, navigate]);

  return (
    <Container>
      <Outlet
        context={{
          musicPause: () => {
            handleAllMusic(false);
          },
        }}
      />
    </Container>
  );
}
