import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./assets/fonts/font.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MusicLayout from "./layouts/MusicLayout";
import MusicQuestion from "./pages/music/MusicQuestion";
// import MusicBasic from "./pages/music/MusicBasic";
// import MusicResult from "./pages/music/MusicResult";
import IntroPage from "./pages/IntroPage";
import MainPage from "./pages/MainPage";
import ArchivePage from "./pages/ArchivePage";

const mode = import.meta.env.MODE;

const router = createBrowserRouter([
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
]);

const routerGit = createBrowserRouter(
  [
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
  ],
  {
    basename: "/Susim",
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={mode === "github" ? routerGit : router} />
  </React.StrictMode>
);
