import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import ReactDOM from "react-dom/client";

import "./index.css";
import "./assets/fonts/font.css";
import "animate.css";

import PopupLayout from "./layouts/PopupLayout";
import MusicLayout from "./layouts/MusicLayout";
import MusicQuestion from "./pages/music/MusicQuestion";
import IntroPage from "./pages/IntroPage";
import MainPage from "./pages/MainPage";
import ArchivePage from "./pages/ArchivePage";

const mode = import.meta.env.MODE;

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
