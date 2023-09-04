import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import database from "../utils/firebase";
import { get, query, limitToFirst, startAfter, orderByChild } from "firebase/database";

import { lineType } from "../components/LinearDataCanvas";

type listType = {
  data: lineType[];
  date: number;
  text: string;
};

const CardLayout = styled.div`
  position: relative;
  height: 18.750rem;

  .front,
  .back {
    width: 100%;
    height: 100%;
    border: 1px solid #ffffff;
    border-radius: 10px;
    padding: 5px;
    transition: all 0.8s ease-out;
  }

  .front {
    background: #000000;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transform: rotateY(180deg);
    background: #ffffff;
    color: #000000;
  }

  &:hover {
    .front {
      transform: rotateY(-180deg);
      z-index: -2;
    }
    
    .back {
      transform: rotateY(0deg);
      z-index: 0;
    }
  }
`;

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
        const db = database("susims");

        // 24시간 이전 데이터부터 가져오기
        const startDate = isFirst ? new Date().getTime() - 1000 * 60 * 60 * 24 : getLastData();
        const queryList = [orderByChild("date"), limitToFirst(size)];

        queryList.push(startAfter(startDate, "date"));

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
      <br />
      <button className="fixed right-4 top-4" onClick={() => navigate("/main")}>
        나가기
      </button>
      <div className="grid gap-4 grid-cols-5 grid-rows-2 w-11/12">
        {list?.map((v, idx) => {
          return (
            <CardLayout>
              <div className="front" key={`fron-${idx}`}>
                {new Date(v.date).toString()}
              </div>
              <div className="back" key={`back-${idx}`}>
                {v.text}
              </div>
            </CardLayout>
          );
        })}
      </div>
      {/* <button
        onClick={() => {
          getSusimList();
        }}
      >
        test
      </button> */}
    </div>
  );
}
