import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import IssueCard from "../components/IssueCard";

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    api.get("/api/issues").then(setIssues).catch(() => {});
    api.get("/api/dashboard/stats").then(setStats).catch(() => {});
  }, []);

  if (user?.role !== "authority") {
    return <div className="container"><div className="error">Authority access required.</div></div>;
  }
  const critical = issues.filter((i) => i.severity === "critical" && !["resolved", "rejected"].includes(i.status));
  const verified = issues.filter((i) => i.status === "verified");

  return (
    <div className="container">
      <h2>🏛️ Municipal Officer Console</h2>
      {stats && (
        <div className="grid cols-4">
          <div className="stat"><div className="v">{stats.totals.total}</div><div className="k">Total</div></div>
          <div className="stat"><div className="v">{stats.totals.resolved}</div><div className="k">Resolved</div></div>
          <div className="stat"><div className="v">{stats.totals.critical_open}</div><div className="k">Critical Open</div></div>
          <div className="stat"><div className="v">{verified.length}</div><div className="k">Awaiting Assign</div></div>
        </div>
      )}

      <h3 style={{ marginTop: 30 }}>🚨 Critical & Open</h3>
      <div className="grid cols-3">
        {critical.map((i) => <IssueCard key={i.id} issue={i} />)}
        {critical.length === 0 && <div className="card muted">No critical issues. 🎉</div>}
      </div>

      <h3 style={{ marginTop: 20 }}>✅ Community-Verified (assign next)</h3>
      <div className="grid cols-3">
        {verified.map((i) => <IssueCard key={i.id} issue={i} />)}
        {verified.length === 0 && <div className="card muted">Nothing waiting for assignment.</div>}
      </div>
    </div>
  );
}
