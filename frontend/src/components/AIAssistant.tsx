import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { useI18n } from "../i18n";

type Msg = { role: "user" | "bot"; text: string };

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your civic assistant. Ask about your reports, ward status, or anything civic." },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim() || busy) return;
    const question = q.trim();
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("question", question); fd.append("lang", lang);
      const r = await api.postForm("/api/assistant/chat", fd);
      setMsgs((m) => [...m, { role: "bot", text: r.reply || "…" }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: "bot", text: "Error: " + err.message }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      <button className="assistant-fab" onClick={() => setOpen(!open)} title={t("assistant")}>
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div className="assistant-panel">
          <div className="head">
            <strong>🤖 {t("assistant")}</strong>
            <span style={{ fontSize: 12, opacity: .85 }}>Gemini</span>
          </div>
          <div className="messages">
            {msgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            {busy && <div className="msg bot">…</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("askQuestion")} />
            <button className="btn sm" disabled={busy}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
