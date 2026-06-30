import { useEffect, useState } from "react";
import { api } from "../api";

export default function Budget() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/api/budget").then(setRows).catch(() => {}); }, []);
  return (
    <div className="container">
      <h2>💰 Budget Dashboard</h2>
      <p>Per-ward infrastructure spending derived from resolved repairs.</p>
      <div className="grid cols-2">
        {rows.map((b) => (
          <div key={b.ward} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{b.ward}</h3>
              <span className="badge">{b.utilization}% used</span>
            </div>
            <div className="progress" style={{ margin: "10px 0" }}>
              <div style={{ width: `${Math.min(100, b.utilization)}%` }} />
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              ₹{b.spent.toLocaleString()} / ₹{b.budget.toLocaleString()}<br />
              {b.resolved} repairs · {b.open} open · avg ₹{b.cost_per_repair}/repair
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="card muted">No budget data yet.</div>}
      </div>
    </div>
  );
}
