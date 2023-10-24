import { createContext } from "react";
import Synth from "../classes/Synth";

export type speechDataType = { tts: boolean; stt: boolean; synth: Synth };
export const SpeechContext = createContext<speechDataType>({ tts: false, stt: false, synth: new Synth() });
