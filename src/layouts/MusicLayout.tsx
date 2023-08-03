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
export default function MusicLayout() {
  const [musicList, setMusicList] = useState<MusicListType>(null);
  const navigate = useNavigate();

  const handleMusicList = useCallback((arr: MusicListType): void => {
    setMusicList(arr);
  }, []);

  const pauseAllMusic = useCallback(() => {
    if (audioList.length > 0)
      audioList.forEach((audio) => {
        audio.pause();
      });

    audioList = [];
  }, []);

  useEffect(() => {
    if (musicList) {
      let long: number | null = null;
      musicList.forEach((num, idx) => {
        const audio = new Audio(musicFileList[idx][num - 1]);

        audioList.push(audio);
        audio.loop = false;
        void audio.play();

        if (!long) long = idx;
        else long = audioList[long].duration < audio.duration ? idx : long;
      });

      if (long) {
        console.log(long, audioList);
        audioList[long].onended = () => {
          console.log("hihi");
          navigate("/music/result");
        };
      }
    } else {
      pauseAllMusic();
    }
  }, [musicList, pauseAllMusic, navigate]);

  useEffect(() => {
    return () => {
      pauseAllMusic();
    };
  }, []);

  return (
    <Container>
      <Outlet context={{ handleMusicList }} />
    </Container>
  );
}
