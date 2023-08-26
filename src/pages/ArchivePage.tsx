// import React from "react";
import { useNavigate } from "react-router-dom";

export default function ArchivePage() {
  const navigate = useNavigate();
  return (
    <div>
      archivePage
      <br />
      <button className="fixed right-4 top-4" onClick={() => navigate("/main")}>
        나가기
      </button>
    </div>
  );
}
