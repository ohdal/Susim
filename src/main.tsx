import React, { useEffect, useState, useCallback, useContext } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./assets/fonts/font.css";
import "animate.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Swal from "sweetalert2";
import MusicLayout from "./layouts/MusicLayout";
import MusicQuestion from "./pages/music/MusicQuestion";
import IntroPage from "./pages/IntroPage";
import MainPage from "./pages/MainPage";
import ArchivePage from "./pages/ArchivePage";

const mode = import.meta.env.MODE;

type Props = { children: JSX.Element };
type userDataType = { tts: boolean; stt: boolean } | null;

const PopupLayout = ({ children }: Props) => {
  const [data, setData] = useState<userDataType>(null);

  const checkUser = useCallback(async (): Promise<userDataType> => {
    const value_tts = sessionStorage.getItem("tts");
    const value_stt = sessionStorage.getItem("stt");
    const popupProps = {
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: "예",
      denyButtonText: "아니요.",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    };

    if (!value_tts || !value_stt) {
      const result_tts = await Swal.fire({ title: "음성해설 기능을 사용하시겠습니까?", ...popupProps });
      const result_stt = await Swal.fire({ title: "자막 기능을 사용하시겠습니까?", ...popupProps });

      sessionStorage.setItem("tts", String(result_tts.value));
      sessionStorage.setItem("stt", String(result_stt.value));

      return { tts: result_tts.value, stt: result_stt.value };
    } else {
      return { tts: Boolean(value_tts), stt: Boolean(value_stt) };
    }
  }, []);

  useEffect(() => {
    checkUser()
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [checkUser]);

  return <div className="w-full h-full">{data && children}</div>;
};

const router_base = [
  {
    path: "/",
    element: <IntroPage />,
  },
  {
    path: "/main/:list",
    element: <MusicLayout />,
    children: [
      {
        path: "",
        element: <MainPage />,
      },
      {
        path: "archive",
        element: <ArchivePage />,
      },
    ],
  },
  {
    path: "/question",
    element: (
      <div className="music-page">
        <Outlet />
      </div>
    ),
    children: [
      {
        path: "",
        element: <MusicQuestion />,
      },
    ],
  },
];

const router = createBrowserRouter(router_base);
const routerGit = createBrowserRouter(router_base, { basename: "/Susim" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PopupLayout>
      <RouterProvider router={mode === "github" ? routerGit : router} />
    </PopupLayout>
  </React.StrictMode>
);
