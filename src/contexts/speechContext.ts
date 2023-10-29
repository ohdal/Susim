import { createContext } from "react";
import instance, { instanceType } from "../classes/Synth";

export type speechDataType = { tts: boolean; stt: boolean; synth: instanceType };
export const SpeechContext = createContext<speechDataType>({ tts: false, stt: false, synth: instance });
