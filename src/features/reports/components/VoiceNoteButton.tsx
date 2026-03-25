import { useState, useRef, useEffect } from "react";
import showToast from "../../../utils/toast";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Props {
  onTranscript: (text: string) => void;
  onInterim: (text: string) => void;
}

export default function VoiceNoteButton({ onTranscript, onInterim }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";

    rec.onresult = (event: any) => {
      let interim = "",
        final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (interim) onInterim(interim);
      if (final) onTranscript(final.trim());
    };
    rec.onerror = (e: any) => {
      if (e.error !== "no-speech")
        showToast.error("Microphone error: " + e.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const toggle = () => {
    if (!supported) {
      showToast.warn("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      onInterim("");
    } else {
      try {
        recRef.current?.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "Stop recording" : "Dictate note (voice to text)"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all
        ${
          listening
            ? "border-red-400/40 bg-red-400/15 text-red-400"
            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-lighter"
        }`}
    >
      {listening ? (
        <>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Recording…
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
            <rect
              x="4.5"
              y="1"
              width="4"
              height="7"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M2 6.5A4.5 4.5 0 006.5 11v0A4.5 4.5 0 0011 6.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M6.5 11v1.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Dictate
        </>
      )}
    </button>
  );
}
