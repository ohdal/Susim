import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { SpeechContext, speechDataType } from "../contexts/speechContext";
import instance from "../classes/Synth";
import LogoBox from "../components/LogoBox";

type Props = { children: JSX.Element };

export default function PopupLayout({ children }: Props) {
  const [data, setData] = useState<speechDataType | null>(null);

  const checkUser = useCallback(async (): Promise<speechDataType> => {
    const popupProps = {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: "예",
      denyButtonText: "아니요",
      customClass: {
        popup: "my-popup",
        title: "popup-title",
        confirmButton: "popup-confirm-btn",
        denyButton: "popup-deny-btn",
      },
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    };

    // 사이트 최초 접속시에 getVoices 메서드를 사용하면
    // 사용가능한 목소리가 있어도 빈 배열이 반환됩니다.
    // 때문에 자막 기능 사용여부를 먼저 물어봅니다.
    // 순서를 변경하지 마세요!
    let result_tts;
    const result_stt = await Swal.fire({ title: "자막 기능을 사용하시겠습니까?", ...popupProps });
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0)
      result_tts = await Swal.fire({ title: "음성해설 기능을 사용하시겠습니까?", ...popupProps });
    else result_tts = { value: false };
    console.log("hihi");

    return { tts: result_tts.value, stt: result_stt.value, synth: instance };
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

  return (
    <div className="w-full h-full">
      {data ? (
        <SpeechContext.Provider value={data}>{children}</SpeechContext.Provider>
      ) : (
        <div className="w-full fixed bottom-0 left-0" style={{ height: "4.625rem" }}>
          <LogoBox position="center" />
        </div>
      )}
    </div>
  );
}
