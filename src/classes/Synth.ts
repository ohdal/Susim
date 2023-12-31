type options = { blocking?: boolean; forced?: boolean; endEvent?: () => void | null; startEvent?: () => void | null };

class Synth {
  private mySynth: SpeechSynthesis;
  private synthSpeak: boolean;

  constructor() {
    this.mySynth = window.speechSynthesis;
    this.synthSpeak = false;
  }

  get isSpeaking() {
    return this.synthSpeak;
  }

  set isSpeaking(v) {
    this.synthSpeak = v;
  }

  public speak(text: string, options?: options) {
    const { blocking, forced, endEvent, startEvent } = options
      ? options
      : { blocking: false, forced: false, endEvent: null, startEvent: null };

    if (this.isSpeaking && !forced) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko";
    utterance.rate = 0.75;
    utterance.pitch = 0.98;

    utterance.onend = () => {
      if (blocking) this.isSpeaking = false;
      if (endEvent) endEvent();
    };

    utterance.onstart = () => {
      if (blocking) this.isSpeaking = true;
      if (startEvent) startEvent();
    };

    this.mySynth.speak(utterance);
  }
}

const singletone = (function () {
  let instance: Synth | null = null;

  return {
    getInstance() {
      if (!instance) instance = new Synth();
      return instance;
    },
  };
})();

export type instanceType = Synth;
export default singletone.getInstance();
