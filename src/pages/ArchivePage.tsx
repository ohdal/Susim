import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import LinearDataCanvas, { lineType, LinearDataCanvasHandle } from "../components/LinearDataCanvas";
import { debounce } from "../utils";
import database from "../utils/firebase";
import { get, query, limitToFirst, startAfter, orderByChild } from "firebase/database";

type CardProps = {
  data: lineType;
  canvasInfo: { width: number; height: number };
  text: string;
};

type listType = {
  data: string;
  canvasInfo: string;
  text: string;
  date: number;
};

const CardLayout = styled.div`
  position: relative;
  height: 18.75rem;

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
    contain: content;
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

function CardComponent(props: CardProps) {
  const { data, text, canvasInfo } = props;
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<LinearDataCanvasHandle | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !layoutRef.current) return;

    const myResize = debounce(() => {
      const width = (layoutRef.current?.clientWidth as number) - 10;
      const height = (layoutRef.current?.clientHeight as number) - 10;
      canvasRef.current?.canvasResize(width, height);
      canvasRef.current?.currentDraw(data, canvasInfo);
    }, 300);

    myResize();

    window.addEventListener("resize", myResize);

    return () => {
      window.removeEventListener("resize", myResize);
    };
  }, [data, canvasInfo]);

  return (
    <CardLayout ref={layoutRef}>
      <div className="front">
        <LinearDataCanvas ref={canvasRef} />
      </div>
      <div className="back">{text}</div>
    </CardLayout>
  );
}

const size = 10;
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
        // const startDate = isFirst ? new Date().getTime() - 1000 * 60 * 60 * 24 : getLastData();
        const startDate = isFirst ? new Date().getTime() - 1000 * 60 * 60 * 24 * 7 : getLastData();
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
    <div className="p-10 w-full h-full">
      <button className="fixed right-4 top-4" onClick={() => navigate("/main")}>
        나가기
      </button>
      <div className="w-full h-full grid overflow-auto">
        <div className="grid gap-4 grid-rows-2 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 items-center">
          {list?.map((v, idx) => {
            return (
              <CardComponent data={JSON.parse(v.data)} text={v.text} canvasInfo={JSON.parse(v.canvasInfo)} key={idx} />
            );
          })}
        </div>
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
