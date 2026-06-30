import { useEffect, useState } from "react";
import { api } from "../api";

export default function Contractors() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/api/dashboard/contractors").then(setRows).catch(() => {}); }, []);
  return (
    <div className="container">
      <h2>🛠️ Contractor Accountability</h2>
      <p>Public scorecard. Lower recurrence + higher resolution rate = better score.</p>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Assigned</th><th>Resolved</th><th>Rate</th><th>Score</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td><td>{r.name}</td><td>{r.assigned}</td><td>{r.resolved}</td>
                <td>{r.resolution_rate}%</td>
                <td><strong>{r.accountability_score}</strong></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: "center", padding: 20 }}>No contractors yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
