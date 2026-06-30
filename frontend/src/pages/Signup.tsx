import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

export default function Signup() {
  const { signup } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "citizen", ward: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const upd = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await signup(form); nav("/dashboard"); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ textAlign: "center" }}>{t("signup")} ✨</h2>
        <p style={{ textAlign: "center", marginBottom: 24 }}>Join {t("appName")}</p>
        <form onSubmit={submit}>
          <label>{t("name")}</label>
          <input value={form.name} onChange={upd("name")} required />
          <label>{t("email")}</label>
          <input type="email" value={form.email} onChange={upd("email")} required />
          <label>{t("password")}</label>
          <input type="password" value={form.password} onChange={upd("password")} required minLength={6} />
          <label>{t("role")}</label>
          <select value={form.role} onChange={upd("role")}>
            <option value="citizen">🙋 {t("citizen")}</option>
            <option value="authority">🏛️ {t("officer")}</option>
            <option value="contractor">🛠️ {t("contractor")}</option>
          </select>
          <label>{t("ward")}</label>
          <input value={form.ward} onChange={upd("ward")} placeholder="e.g. Ward 4" />
          {err && <div className="error">{err}</div>}
          <button className="btn" style={{ width: "100%", marginTop: 20 }} disabled={busy}>
            {busy ? "…" : t("signup")}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
          Already registered? <Link to="/login">{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}
