import { useRef, useState } from "react";
import { api } from "../api";
import { useI18n } from "../i18n";

export default function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => chunks.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("audio", blob, "voice.webm");
        const r = await api.postForm("/api/assistant/transcribe", fd);
        onTranscript((r.english || r.transcript || "").trim());
      } catch (e) { /* swallow */ }
      finally { setBusy(false); }
    };
    rec.start(); recRef.current = rec; setRecording(true);
  };
  const stop = () => { recRef.current?.stop(); setRecording(false); };

  return (
    <div className="voice-rec">
      <span style={{ fontSize: 22 }}>🎤</span>
      {!recording ? (
        <button type="button" onClick={start} disabled={busy}>
          {busy ? t("transcribing") : "● " + t("recordVoice")}
        </button>
      ) : (
        <button type="button" className="rec" onClick={stop}>■ {t("stopRecording")}</button>
      )}
      <span className="muted" style={{ fontSize: 12 }}>{t("voice")} → Gemini</span>
    </div>
  );
}
