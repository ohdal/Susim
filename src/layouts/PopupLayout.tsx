import { useState, useEffect, useCallback } from "react";
import { ServiceContext, serviceDataType } from "../utils/speechService";
import Swal from "sweetalert2";

type Props = { children: JSX.Element };

export default function PopupLayout({ children }: Props) {
  const [data, setData] = useState<serviceDataType | null>(null);

  const checkUser = useCallback(async (): Promise<serviceDataType> => {
    const popupProps = {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonColor: "#70acd3",
      denyButtonColor: "#d76565",
      confirmButtonText: "예",
      denyButtonText: "아니요",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    };

    const result_tts = await Swal.fire({ title: "음성해설 기능을 사용하시겠습니까?", ...popupProps });
    // const result_stt = await Swal.fire({ title: "자막 기능을 사용하시겠습니까?", ...popupProps });
    const result_stt = { value: false };

    return { tts: result_tts.value, stt: result_stt.value };
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
      {data && <ServiceContext.Provider value={data}>{children}</ServiceContext.Provider>}
    </div>
  );
}
