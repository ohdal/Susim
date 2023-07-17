import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import MainPage from "./pages/MainPage";
import ArchivePage from "./pages/ArchivePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IntroPage />,
  },
  {
    path: "/main",
    element: <MainPage />,
  },
  {
    path: "/archive",
    element: <ArchivePage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
