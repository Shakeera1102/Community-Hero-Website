import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import IssueCard from "../components/IssueCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [issues, setIssues] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    api.get("/api/issues").then(setIssues).catch(() => {});
    api.get("/api/dashboard/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2>{t("welcome")}, {user?.name} 👋</h2>
          <p style={{ margin: 0 }}>{user?.role.toUpperCase()} · {user?.ward || "—"} · ⭐ {user?.points} pts</p>
        </div>
        <Link to="/report" className="btn">+ {t("report")}</Link>
      </div>

      {stats && (
        <div className="grid cols-3" style={{ marginTop: 20 }}>
          <div className="stat"><div className="v">{stats.totals.total || 0}</div><div className="k">Total Reports</div></div>
          <div className="stat"><div className="v">{stats.totals.resolved || 0}</div><div className="k">Resolved</div></div>
          <div className="stat"><div className="v">{stats.totals.critical_open || 0}</div><div className="k">Critical Open</div></div>
        </div>
      )}

      <h3 style={{ marginTop: 30 }}>{t("recent")}</h3>
      <div className="grid cols-3">
        {issues.map((i) => <IssueCard key={i.id} issue={i} />)}
      </div>
      {issues.length === 0 && <div className="card muted">{t("noIssues")}</div>}
    </div>
  );
}
