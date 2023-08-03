// import React from "react";
import { useNavigate } from "react-router-dom";

export default function ArchivePage() {
  const navigate = useNavigate();
  return (
    <div>
      archivePage
      <br />
      <button onClick={() => navigate("/main")}>Go MainPage</button>
    </div>
  );
}
