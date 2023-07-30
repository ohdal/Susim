import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MusicLayout from "./layouts/MusicLayout";
import MusicBasic from "./pages/music/MusicBasic";
import MusicQuestion from "./pages/music/MusicQuestion";
import MusicResult from "./pages/music/MusicResult";
// import IntroPage from "./pages/IntroPage";
// import MainPage from "./pages/MainPage";
// import ArchivePage from "./pages/ArchivePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MusicLayout />,
    children: [
      {
        path: "",
        element: <MusicBasic />,
      },
      {
        path: "question",
        element: <MusicQuestion />,
      },
      {
        path: "result",
        element: <MusicResult />,
      },
    ],
  },
  // {
  //   path: "/",
  //   element: <IntroPage />,
  // },
  // {
  //   path: "/main",
  //   element: <MainPage />,
  // },
  // {
  //   path: "/archive",
  //   element: <ArchivePage />,
  // },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
