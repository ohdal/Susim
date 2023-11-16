import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import database from "../services/firebase";
import { get, query, limitToFirst, startAfter, orderByChild, equalTo } from "firebase/database";

import { Scrollbars, positionValues } from "react-custom-scrollbars";
import AOS from "aos";
import "aos/dist/aos.css"; // You can also use <link> for styles

import { SpeechContext } from "../contexts/speechContext";
import CardComponent from "../components/CardComponent";
import LogoBox from "../components/LogoBox";

type listType = {
  data: string;
  canvasInfo: string;
  text: string;
  date: number;
};

const PAGE_SIZE = 5;
export default function ArchivePage() {
  const navigate = useNavigate();
  const speechService = useContext(SpeechContext);
  const innerRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<listType[] | null>(null);
  const [isLast, setIsLast] = useState(false);

  const getStartDate = useCallback((): number => {
    // 24시간 이내 데이터 가져오기
    if (!list) return new Date().getTime() - 1000 * 60 * 60 * 24;
    else {
      const idx = list.length - 1;
      return list[idx].date;
    }
  }, [list]);

  const getEqualData = useCallback(
    async (lastData: listType): Promise<listType[] | null> => {
      let result: listType[] | null = null;
      if (list) {
        const db = database("susims");

        const snapshot = await get(query(db, orderByChild("date"), equalTo(lastData.date)));

        if (snapshot.exists()) {
          const data = Object.values(snapshot.val() as object);

          if (data.length > 1) {
            let curIdx = 0;

            data.forEach((v, idx) => {
              if (v.text === lastData.text) curIdx = idx;
            });

            if (curIdx !== data.length - 1) result = data.slice(curIdx + 1);
          }
        }
      }

      return result && result.length > 5 ? result.slice(0, 5) : result;
    },
    [list]
  );

  const getSusimList = useCallback(
    async (isFirst = false) => {
      if (!isLast) {
        // 중복 데이터 처리
        let equalDataArr: listType[] | null = null;
        let size = PAGE_SIZE;
        if (list) {
          const idx = list.length - 1;
          equalDataArr = await getEqualData(list[idx]);
          size = equalDataArr ? PAGE_SIZE - equalDataArr.length : size;
        }

        if (size > 0) {
          const db = database("susims");

          const startDate = getStartDate();
          const queryList = [orderByChild("date"), limitToFirst(size)];

          queryList.push(startAfter(startDate, "date"));

          get(query(db, ...queryList))
            .then((snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.val();
                let newArr = Object.values(data as object);

                if (equalDataArr) newArr = equalDataArr.concat(newArr);
                if (newArr.length < PAGE_SIZE) setIsLast(true);

                if (isFirst) {
                  setList(newArr);
                } else {
                  setList((list as listType[]).concat(newArr));
                }
              } else {
                if (!list) setList([]);
                if (speechService.tts && isFirst)
                  speechService.synth.speak("24시간 이내에 작성된 수심이 존재하지 않습니다. 우측 상단에 나가기 버튼");

                setIsLast(true);
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          if (list && equalDataArr) setList(list.concat(equalDataArr));
        }
      }
    },
    [getStartDate, getEqualData, isLast, list, speechService]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const clientHeight = (e.target as HTMLDivElement).clientHeight;
      const scrollHeight = (e.target as HTMLDivElement).scrollHeight;
      const scrollTop = (e.target as HTMLDivElement).scrollTop;

      if (scrollHeight - clientHeight === Math.round(scrollTop)) {
        void getSusimList();
        setTimeout(() => {
          const target = e.target as HTMLDivElement;
          target.scrollTop += 50;
        }, 300);
      }
    },
    [getSusimList]
  );

  const getOutterHeight = useCallback(
    (v: positionValues) => {
      if (!list) {
        void getSusimList(true);
      } else {
        if (innerRef.current && v.clientHeight >= innerRef.current.clientHeight) {
          void getSusimList();
        }
      }
    },
    [getSusimList, list]
  );

  useEffect(() => {
    AOS.init();
    if (speechService.tts)
      speechService.synth.speak("아카이브 페이지입니다. 우측 상단에 나가기 버튼.", { blocking: true });
  }, [speechService]);

  return (
    <div className="w-full h-full">
      <div className="w-full relative" style={{ height: "4.625rem" }}>
        <button
          className="gradient-btn fixed right-4 top-4"
          onFocus={() => {
            if (speechService.tts) speechService.synth.speak("나가기 버튼");
          }}
          onClick={() => {
            if (speechService.tts) speechService.synth.speak("클릭");
            navigate("../main", { relative: "path", state: "archive" });
          }}
        >
          나가기
        </button>
      </div>
      <div className="pl-20 pr-20" style={{ height: "calc(100% - 9.25rem)" }}>
        <Scrollbars onScroll={handleScroll} onUpdate={getOutterHeight} style={{ width: "100%", height: "100%" }}>
          {list ? (
            list.length > 0 ? (
              <div
                className="grid xs_card:grid-cols-2 sm_card:grid-cols-3 md_card:grid-cols-4 lg_card:grid-cols-5 justify-items-center"
                style={{ width: "clac(100% - 17px)", maxWidth: "1060px", margin: "0 auto" }}
                ref={innerRef}
              >
                {list.map((v, idx) => {
                  return <CardComponent data={v.data} text={v.text} canvasInfo={v.canvasInfo} key={idx} />;
                })}
              </div>
            ) : (
              <div className="w-full h-full grid">
                <p className="place-self-center">24시간내 작성된 수심이 존재하지 않습니다.</p>
              </div>
            )
          ) : (
            <div className="w-full h-full grid">
              <div className="place-self-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 inline-block"
                  fill="#ffffff"
                  height="200px"
                  width="200px"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 220 220"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier"></g>
                  <g id="SVGRepo_tracerCarrier"></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M158.505,10.987l12.99,7.5L154.29,48.289l-12.99-7.5L158.505,10.987z M209.013,61.495l-7.5-12.99L171.711,65.71l7.5,12.99 L209.013,61.495z M185.59,117.5H220v-15h-34.41V117.5z M171.711,154.29l29.802,17.205l7.5-12.99L179.211,141.3L171.711,154.29z M141.3,179.211l17.205,29.802l12.99-7.5l-17.205-29.802L141.3,179.211z M102.5,220h15v-34.41h-15V220z M48.505,201.513l12.99,7.5 L78.7,179.211l-12.99-7.5L48.505,201.513z M10.987,158.505l7.5,12.99l29.802-17.205l-7.5-12.99L10.987,158.505z M0,117.5h34.41v-15 H0V117.5z M48.288,65.71L18.487,48.505l-7.5,12.99L40.788,78.7L48.288,65.71z M48.505,18.487L65.71,48.288l12.99-7.5L61.495,10.987 L48.505,18.487z M102.5,34.409h15V0h-15V34.409z"></path>{" "}
                  </g>
                </svg>
                수심을 불러오는 중입니다...
              </div>
            </div>
          )}
        </Scrollbars>
      </div>
      <div className="w-full" style={{ height: "4.625rem" }}>
        <LogoBox position="left"/>
      </div>
    </div>
  );
}
