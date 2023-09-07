import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import database from "../utils/firebase";
import { get, query, limitToFirst, startAfter, orderByChild } from "firebase/database";

import CardComponent from "../components/CardComponent";

type listType = {
  data: string;
  canvasInfo: string;
  text: string;
  date: number;
};

const size = 5;
export default function ArchivePage() {
  const navigate = useNavigate();
  const outterRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<listType[] | null>(null);
  const [isLast, setIsLast] = useState(false);

  const getStartDate = useCallback((): number => {
    if (!list) return new Date().getTime() - 1000 * 60 * 60 * 24 * 14;
    else {
      const idx = list.length - 1;
      return list[idx].date;
    }
  }, [list]);

  const getSusimList = useCallback(
    (isFirst = false) => {
      if (!isLast) {
        const db = database("susims");

        // 24시간 이전 데이터부터 가져오기
        // const startDate = isFirst ? new Date().getTime() - 1000 * 60 * 60 * 24 : getLastData();
        const startDate = getStartDate();
        const queryList = [orderByChild("date"), limitToFirst(size)];

        queryList.push(startAfter(startDate, "date"));

        get(query(db, ...queryList))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const newArr = Object.values(data as object);

              if (newArr.length < size) setIsLast(true);

              if (isFirst) {
                setList(newArr);
              } else {
                setList((list as listType[]).concat(newArr));
              }
            } else {
              setIsLast(true);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    [getStartDate, isLast, list]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const clientHeight = (e.target as HTMLDivElement).clientHeight;
      const scrollHeight = (e.target as HTMLDivElement).scrollHeight;
      const scrollTop = (e.target as HTMLDivElement).scrollTop;

      if (scrollHeight - clientHeight === scrollTop) getSusimList();
    },
    [getSusimList]
  );

  useEffect(() => {
    if (!list) getSusimList(true);
    else {
      if (outterRef.current && innerRef.current && outterRef.current.clientHeight >= innerRef.current.clientHeight)
        getSusimList();
    }
  }, [getSusimList, list]);

  return (
    <div className="p-16 w-full h-full">
      <button className="fixed right-4 top-4" onClick={() => navigate("/main")}>
        나가기
      </button>
      <div
        className="w-full h-full grid overflow-auto"
        ref={outterRef}
        onScroll={(e) => {
          handleScroll(e);
        }}
      >
        <div
          className="grid gap-4 grid-rows-2 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 items-center"
          ref={innerRef}
        >
          {list?.map((v, idx) => {
            return <CardComponent data={v.data} text={v.text} canvasInfo={v.canvasInfo} key={idx} />;
          })}
        </div>
      </div>
    </div>
  );
}
