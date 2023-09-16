import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { musicFileList } from "../constant/Data";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type MusicListType = number[] | null;
export type ContextType = { handleMusicList: (arr: MusicListType) => void };

let audioList: HTMLAudioElement[] = [];
let loadedCount = 0;
export default function MusicLayout() {
  const [musicList, setMusicList] = useState<MusicListType>(null);
  const navigate = useNavigate();
  const { list } = useParams();

  const handleMusicList = useCallback((arr: MusicListType): void => {
    setMusicList(arr);
  }, []);

  const handleAllMusic = useCallback((type = false) => {
    if (audioList.length > 0) {
      audioList.forEach((audio) => {
        if (type) {
          void audio.play();
        } else {
          audio.pause();
        }
      });

      if (!type) audioList = [];
      else loadedCount = 0;
    }
  }, []);

  const loadedEvent = useCallback(() => {
    loadedCount++;
    if (loadedCount === musicFileList.length) {
      console.log("all loaded", audioList);
      handleAllMusic(true);
    }
  }, [handleAllMusic]);

  useEffect(() => {
    if (musicList) {
      console.log("musicList", musicList);
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
          console.error(err);
          alert("설정에서 해당 브라우저 음악재생을 허용해준 뒤, 다시 카드를 선택해주세요.");
          navigate("/");
        });
    } else {
      handleAllMusic();
    }
  }, [musicList, loadedEvent, handleAllMusic, navigate]);

  useEffect(() => {
    if (list) handleMusicList(list.split("").map((v) => Number(v)));

    return () => {
      handleAllMusic();
      setMusicList(null);
    };
  }, [handleAllMusic, handleMusicList, list]);

  return (
    <Container>
      <Outlet context={{ handleMusicList }} />
    </Container>
  );
}
