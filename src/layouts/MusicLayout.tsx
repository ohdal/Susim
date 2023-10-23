import { useEffect, useCallback, useContext, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { musicFileList } from "../constants/Data";
import { ServiceContext, mySynth } from "../services/speechService";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type MusicListType = number[] | null;
export type ContextType = { musicPause: () => void; musicPlay: () => void; getMusicInfo: () => string[] };

let audioList: HTMLAudioElement[] = [];
let loadedCount = 0;
export default function MusicLayout() {
  const [isAllowMusic, setIsAllowMusic] = useState(false);
  const [musicInfoList, setMusicInfoList] = useState<string[]>([]);
  const navigate = useNavigate();
  const { list } = useParams();
  const service = useContext(ServiceContext);

  const handleAllMusic = useCallback((type: boolean) => {
    if (audioList.length > 0) {
      audioList.forEach((audio) => {
        if (type) {
          void audio.play();
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
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
        audioList = [];
        let long = 0;
        const firstMusic = musicList[0] - 1;
        const testAudio = new Audio(musicFileList[0][firstMusic].file);

        testAudio.loop = false;
        testAudio
          .play()
          .then(() => {
            setIsAllowMusic(true);
            testAudio.pause();

            const tempInfoList = [];
            for (let i = 0; i < musicList.length; i++) {
              const num = musicList[i] - 1;
              const { file, desc } = musicFileList[i][num];
              const audio = new Audio(file);

              tempInfoList.push(desc);
              audioList.push(audio);
              audio.loop = true;
              audio.onloadeddata = loadedEvent;

              long = audioList[long].duration < audio.duration ? i : long;
            }

            setMusicInfoList(tempInfoList);
            // audioList[long].onended = () => {
            //   navigate("/result");
            // };
          })
          .catch((err) => {
            console.log(`에러발생 ${err as string}`);
            testAudio.pause();

            if (service.tts && !mySynth.isSpeaking)
              mySynth.speak(
                "설정에서 해당 브라우저 음악재생을 허용해준 뒤, 카드를 다시 선택해주세요. 카드 선택 화면으로 돌아갑니다. ",
                {
                  endEvent: () => {
                    navigate("/question");
                  },
                }
              );
            else {
              alert("설정에서 해당 브라우저 음악재생을 허용해준 뒤, 다시 카드를 선택해주세요.");
              navigate("/question");
            }
          });
      }
    },
    [loadedEvent, navigate, service]
  );

  useEffect(() => {
    if (list) {
      const reg = new RegExp("^[0-9]{5}$");
      const result = reg.test(list);
      if (result) {
        musicPlay(list.split("").map((v) => Number(v)));
      } else {
        if (service.tts) {
          mySynth.speak("잘못된 접근입니다. 카드 선택 페이지로 돌아갑니다.", {
            endEvent: () => {
              navigate("/question");
            },
          });
          return;
        } else alert("잘못된 접근입니다.");

        navigate("/question");
      }
    }

    return () => {
      handleAllMusic(false);
      audioList = [];
      loadedCount = 0;
    };
  }, [list]);

  return (
    <Container>
      {isAllowMusic && (
        <Outlet
          context={{
            getMusicInfo: () => {
              return musicInfoList;
            },
            musicPause: () => {
              handleAllMusic(false);
            },
            musicPlay: () => {
              handleAllMusic(true);
            },
          }}
        />
      )}
    </Container>
  );
}
