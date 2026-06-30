import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useI18n } from "../i18n";
import VoiceRecorder from "../components/VoiceRecorder";

export default function ReportIssue() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [desc, setDesc] = useState("");
  const [ward, setWard] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<any>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      setLat(String(p.coords.latitude)); setLng(String(p.coords.longitude));
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("description", desc); fd.append("ward", ward);
      if (lat) fd.append("lat", lat);
      if (lng) fd.append("lng", lng);
      if (file) fd.append("image", file);
      const r = await api.postForm("/api/issues", fd);
      setResult(r);
      setTimeout(() => nav(r.merged_into ? `/issues/${r.merged_into}` : `/issues/${r.issue.id}`), 1800);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2>📝 {t("report")}</h2>
      <p>Upload a photo, record your voice, or just describe the problem. Gemini handles the rest.</p>

      <div className="card">
        <form onSubmit={submit}>
          <label>📸 {t("photo")} / 🎥 {t("video")}</label>
          <input type="file" accept="image/*,video/*" capture="environment"
                 onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <label>🎤 {t("voice")}</label>
          <VoiceRecorder onTranscript={(txt) => setDesc((d) => (d ? d + " " : "") + txt)} />

          <label>✍️ {t("description")}</label>
          <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)}
                    placeholder="Big pothole near the school gate…" />

          <label>{t("ward")}</label>
          <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Ward 4" />

          <label>📍 {t("location")}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat" />
            <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="lng" />
            <button type="button" className="btn ghost" onClick={useMyLocation} style={{ whiteSpace: "nowrap" }}>
              📍 {t("useMyLocation")}
            </button>
          </div>

          {err && <div className="error">{err}</div>}
          <button className="btn" style={{ marginTop: 24, width: "100%" }} disabled={busy}>
            {busy ? "🧠 " + t("analyzing") : "🚀 " + t("submit")}
          </button>
        </form>
      </div>

      {result && (
        <div className="card gradient">
          <h3>🧠 Gemini Analysis</h3>
          {result.merged_into ? (
            <p>This matches an existing report. Merged into <strong>#{result.merged_into}</strong>.</p>
          ) : (
            <>
              <div style={{ marginBottom: 8 }}><strong>{t("category")}:</strong> {result.ai?.category}</div>
              <div style={{ marginBottom: 8 }}>
                <strong>{t("severity")}:</strong> <span className={`badge ${result.ai?.severity}`}>{result.ai?.severity}</span> ({result.ai?.severity_score}/100)
              </div>
              <div style={{ marginBottom: 8 }}><strong>{t("department")}:</strong> {result.ai?.department}</div>
              <div className="muted" style={{ marginTop: 8 }}>{result.ai?.reasoning}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
