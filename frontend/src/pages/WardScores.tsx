import { useEffect, useState } from "react";
import { api } from "../api";

const tier = (s: number) => s >= 85 ? ["Excellent", "#34d399"]
  : s >= 70 ? ["Good", "#6ee7b7"] : s >= 50 ? ["Average", "#fbbf24"]
  : s >= 30 ? ["Poor", "#f87171"] : ["Critical", "#ef4444"];

export default function WardScores() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/api/dashboard/wards").then(setRows).catch(() => {}); }, []);
  return (
    <div className="container">
      <h2>🏘️ Ward Health Scoreboard</h2>
      <p>Live score per ward based on open issues, criticals, and resolutions.</p>
      <div className="grid cols-3">
        {rows.map((r) => {
          const [label, color] = tier(r.health_score);
          return (
            <div key={r.ward} className="card">
              <h3>{r.ward}</h3>
              <div style={{ fontSize: 40, fontWeight: 800, color }}>{r.health_score}</div>
              <div className="badge" style={{ background: color + "33", color }}>{label}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                Open: {r.open_count} · Critical: {r.critical_open} · Resolved: {r.resolved_count}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="card muted">No ward data yet.</div>}
      </div>
    </div>
  );
}
