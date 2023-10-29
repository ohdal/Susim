import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { SpeechContext, speechDataType } from "../contexts/speechContext";
import instance from "../classes/Synth";

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

    let result_tts;
    // if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0)
    if (window.speechSynthesis)
      result_tts = await Swal.fire({ title: "음성해설 기능을 사용하시겠습니까?", ...popupProps });
    else result_tts = { value: false };
    const result_stt = await Swal.fire({ title: "자막 기능을 사용하시겠습니까?", ...popupProps });

    return { tts: result_tts.value, stt: result_stt.value, synth: instance };
  }, []);

  useEffect(() => {
    const loadEvent = () => {
      checkUser()
        .then((result) => {
          setData(result);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    window.onload = loadEvent;

    return () => {
      window.onload = null;
    };
  }, [checkUser]);

  return (
    <div className="w-full h-full">
      {data && <SpeechContext.Provider value={data}>{children}</SpeechContext.Provider>}
    </div>
  );
}
