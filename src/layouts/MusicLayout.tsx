import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { musicFileList } from "../constant/Data";

const Container = styled.div`
  width: 100%;
  height: 100%;

  .content {
    position: relative;
    width; 100%;
    height: 100%;
    padding: 30px 20px;
  }

  .footer {
    width: 100%;
    height: 84px;
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 30px;

    button,
    a {
      float: right;
      cursor: pointer;
      background: transparent;
      border: none;
      padding: 0;
      text-decoration: none;
      font-size: 24px;
      line-height: 24px;
      color: #ffffff;
    }
  }
`;

type MusicListType = number[] | null;
export type ContextType = { handleMusicList: (arr: MusicListType) => void };

let audioList: HTMLAudioElement[] = [];
let loadedCount = 0;
export default function MusicLayout() {
  const [musicList, setMusicList] = useState<MusicListType>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (musicList) {
      let long = 0;
      const firstMusic = musicList[0] - 1;
      const testAudio = new Audio(musicFileList[0][firstMusic]);

      const loadedEvent = () => {
        loadedCount++;
        if (loadedCount === musicFileList.length) handleAllMusic(true);
      };

      testAudio.loop = false;
      testAudio.onloadeddata = loadedEvent;
      testAudio
        .play()
        .then(() => {
          audioList.push(testAudio);

          for (let i = 1; i < musicList.length; i++) {
            const num = musicList[i] - 1;
            const audio = new Audio(musicFileList[i][num]);

            audioList.push(audio);
            audio.loop = false;
            audio.onloadeddata = loadedEvent;

            long = audioList[long].duration < audio.duration ? i : long;
          }

          audioList[long].onended = () => {
            navigate("/result");
          };
        })
        .catch(() => {
          alert("설정에서 해당 브라우저 음악재생을 허용해준 뒤, 다시 사이트에 접속해주세요.");
          navigate("/");
        });
    } else {
      handleAllMusic();
    }
  }, [musicList, handleAllMusic, navigate]);

  useEffect(() => {
    return () => {
      handleAllMusic();
    };
  }, [handleAllMusic]);

  return (
    <Container>
      <Outlet context={{ handleMusicList }} />
    </Container>
  );
}
