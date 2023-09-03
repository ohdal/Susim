import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import database from "../utils/firebase";
import { get, query, limitToFirst, startAfter, orderByChild } from "firebase/database";

import { lineType } from "../components/LinearDataCanvas";

type listType = {
  data: lineType[];
  date: number;
  text: string;
};

const size = 5;
export default function ArchivePage() {
  const navigate = useNavigate();
  const [list, setList] = useState<listType[] | null>(null);
  const [isLast, setIsLast] = useState(false);

  const getLastData = useCallback((): number => {
    if (!list) return 0;

    const idx = list.length - 1;
    return list[idx].date;
  }, [list]);

  const getSusimList = useCallback(
    (isFirst = false) => {
      if (!isLast) {
        console.log("in");
        const db = database("susims");
        const queryList = [orderByChild("date"), limitToFirst(size)];
        if (!isFirst) queryList.push(startAfter(getLastData(), "date"));

        get(query(db, ...queryList))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const newArr = Object.values(data as object);

              if (newArr.length < size) setIsLast(true);

              if (isFirst) {
                console.log(newArr);
                setList(newArr);
              } else {
                setList((v) => {
                  return v ? v.concat(newArr) : v;
                });
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
    [getLastData, isLast]
  );

  useEffect(() => {
    if (!list) getSusimList(true);
  }, [getSusimList, list]);

  return (
    <div>
      archivePage
      <br />
      <button className="fixed right-4 top-4" onClick={() => navigate("/main")}>
        나가기
      </button>
      {list?.map((v, idx) => {
        return <div key={idx}>{v.text}</div>;
      })}
      <button
        onClick={() => {
          getSusimList();
        }}
      >
        test
      </button>
    </div>
  );
}
