import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

const features = [
  { icon: "📸", title: "Photo + Voice + Text", body: "Report in any Indian language with image, video, or voice." },
  { icon: "🧠", title: "Gemini Triage", body: "AI auto-classifies, scores severity, and routes to the right department." },
  { icon: "🗺️", title: "Live Hyperlocal Map", body: "See every reported issue in your ward in real-time on OpenStreetMap." },
  { icon: "🔄", title: "Duplicate Merging", body: "Nearby reports of the same issue auto-merge with community upvotes." },
  { icon: "✅", title: "AI Before/After Verify", body: "Gemini Vision compares repair photos to confirm the fix is real." },
  { icon: "🔮", title: "Predictive Hotspots", body: "Forecast where floods, potholes, and outages will hit next." },
  { icon: "🏆", title: "Citizen Gamification", body: "Earn points, badges, and rank up by helping your community." },
  { icon: "🛠️", title: "Contractor Accountability", body: "Public scores keep contractors honest. Officers stay in control." },
  {
    icon: "🔔",
    title: "Real-Time Notifications",
    body: "Citizens, officers, and contractors receive instant updates on issue progress, assignments, approvals, and resolutions."
  }
];


const workflow = [
  {
    n: "01", title: "Citizen Reports Issue",
    body: "Citizen captures a photo / voice / text complaint with auto GPS + ward detection. Works in 5 Indian languages.",
    actor: "Citizen",
  },
  {
    n: "02", title: "Gemini AI Triage",
    body: "Google Gemini classifies category (pothole, garbage, water, light…), assigns severity 0–100 and routes to the correct department.",
    actor: "AI",
  },
  {
    n: "03", title: "Duplicate Detection & Verification",
    body: "Reports within ~150m of the same category auto-merge. Neighbours upvote and verify, moving status to ✅ Verified.",
    actor: "Community",
  },
  {
    n: "04", title: "Officer Reviews on Console",
    body: "Municipal Officer sees a live queue sorted by severity, ward heatmap, contractor scoreboard and budget impact — all in one dashboard.",
    actor: "Municipal Officer",
  },
  {
    n: "05", title: "Officer Assigns a Worker / Contractor",
    body: "Officer picks the best-rated contractor or field worker from the roster (live load, past resolution rate, ward expertise) and assigns the job in one click.",
    actor: "Municipal Officer",
  },
  {
    n: "06", title: "Live Worker Tracking",
    body: "Worker sees the task on mobile, accepts, and shares live location. Officer tracks ETA, on-site time, and SLA countdown on the map.",
    actor: "Worker",
  },
  {
    n: "07", title: "After-Photo + AI Verification",
    body: "Worker uploads the repaired-photo. Gemini Vision compares before vs after and marks the issue ✅ Resolved or ❌ Rejected automatically.",
    actor: "AI + Worker",
  },
  {
    n: "08", icon: "", title: "Recurrence + Insights",
    body: "Recurrence risk (30/60/90 days), ward health score, contractor scorecard and predictive hotspots update live for data-driven governance.",
    actor: "System",
  },
];

export default function Landing() {
  const { t } = useI18n();
  return (
    <>
      <section className="hero hero-map">
        <div className="hero-inner">
          <span className="pill">🇮🇳 Built for Andhra Pradesh · Telangana · Pan-India</span>
          <h1>{t("appName")}</h1>
          <p className="hero-sub">{t("heroBody")}</p>
          <div className="cta">
            <Link to="/signup" className="btn">🚀 {t("getStarted")}</Link>
            <Link to="/map" className="btn ghost">🗺️ Live Map</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="grid cols-4">
          <div className="stat"><div className="v">8</div><div className="k">Workflow Stages</div></div>
          <div className="stat"><div className="v">5</div><div className="k">Languages</div></div>
          <div className="stat"><div className="v">3</div><div className="k">User Roles</div></div>
          <div className="stat"><div className="v">100%</div><div className="k">Gemini-Powered</div></div>
        </div>

        {/* ── Workflow ── */}
        <h2 style={{ marginTop: 50 }}>🔁 End-to-End Workflow</h2>
        <p style={{ maxWidth: 780 }}>
          From a citizen's tap to a verified repair — Community Hero AI runs the full civic lifecycle.
          The municipal officer stays in command: assigning workers, tracking them live and validating every fix with AI.
        </p>

        <div className="workflow">
          {workflow.map((s, i) => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-card">
                <div className="step-head">
                  <span className="step-icon">{s.icon}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{s.title}</h3>
                    <span className="step-actor">{s.actor}</span>
                  </div>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 14 }}>{s.body}</p>
              </div>
              {i < workflow.length - 1 && <div className="step-link" />}
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 50 }}>✨ What makes it different</h2>
        <div className="grid cols-3">
          {features.map((f) => (
            <div key={f.title} className="card glass">
              <div style={{ fontSize: 30 }}>{f.icon}</div>
              <h3 style={{ marginTop: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>

        <div className="card gradient" style={{ marginTop: 40, textAlign: "center", padding: 40 }}>
          <h2>Ready to be a Community Hero?</h2>
          <p>Sign up as a Citizen, Officer, or Contractor and start fixing your city.</p>
          <Link to="/signup" className="btn" style={{ marginTop: 16 }}>{t("signup")}</Link>
        </div>
      </div>
    </>
  );
}
