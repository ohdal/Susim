import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

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
export type ContextType = { handleMusicList: (arr:  MusicListType) => void };

export default function MusicLayout() {
  const [musicList, setMusicList] = useState< MusicListType>(null);

  const handleMusicList = useCallback((arr:  MusicListType): void => {
    setMusicList(arr);
  }, []);

  useEffect(() => {
    if (musicList) {
      console.log("musicList", musicList);
    } else {
      console.log("musicList", musicList);
    }
  }, [musicList]);

  return (
    <Container>
      <Outlet context={{ handleMusicList }} />
    </Container>
  );
}
