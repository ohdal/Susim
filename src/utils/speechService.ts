import { createContext } from "react";

export type serviceDataType = { tts: boolean; stt: boolean };
export const ServiceContext = createContext<serviceDataType>({ tts: true, stt: false });

class Synth {
  private mySynth: SpeechSynthesis;

  constructor() {
    this.mySynth = window.speechSynthesis;
  }

  get isSpeaking() {
    return this.mySynth.speaking;
  }

  get isPending() {
    return this.mySynth.pending;
  }

  public speak(text: string, event?: { end?: () => void; start?: () => void }) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko";
    utterance.rate = 0.75;
    utterance.pitch = 0.98;
    utterance.onerror = (e) => {
      console.error(e.error);
    };

    if (event) {
      const { end, start } = event;
      if (end) utterance.onend = end;
      if (start) utterance.onstart = start;
    }

    this.mySynth.speak(utterance);
  }

  public pause() {
    this.mySynth.pause();
  }

  public resume() {
    this.mySynth.resume();
  }

  public cancel() {
    this.mySynth.cancel();
  }
}

export const mySynth = new Synth();
