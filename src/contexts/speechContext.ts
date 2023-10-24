import { createContext } from "react";
import Synth from "../classes/Synth";

export type serviceDataType = { tts: boolean; stt: boolean; synth: Synth };
export const ServiceContext = createContext<serviceDataType>({ tts: false, stt: false, synth: new Synth() });
