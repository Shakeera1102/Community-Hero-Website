import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await login(email, password); nav("/dashboard"); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ textAlign: "center" }}>{t("welcome")} 👋</h2>
        <p style={{ textAlign: "center", marginBottom: 24 }}>{t("login")} {t("appName")}</p>
        <form onSubmit={submit}>
          <label>{t("email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>{t("password")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <div className="error">{err}</div>}
          <button className="btn" style={{ width: "100%", marginTop: 20 }} disabled={busy}>
            {busy ? "…" : t("login")}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
          New here? <Link to="/signup">{t("signup")}</Link>
        </p>
      </div>
    </div>
  );
}
