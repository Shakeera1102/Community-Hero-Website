import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Predictions() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get("/api/dashboard/predictions").then(setData).catch(() => {}); }, []);
  
  return (
    <div className="container">
      <h2>🔮 Predictive Hotspots</h2>
      <p>Gemini forecasts where civic issues are likely to occur next, based on history and seasonal patterns.</p>
      {!data && <div className="card muted">Loading…</div>}
      <div className="grid cols-2">
        {data?.hotspots?.map((h: any, i: number) => (
          <div key={i} className="card gradient">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{h.ward}</h3>
              <span className={`badge ${h.risk}`}>{h.risk} risk</span>
            </div>
            <div style={{ fontSize: 18, margin: "8px 0" }}><strong>{h.issue}</strong></div>
            <p style={{ margin: 0, fontSize: 14 }}>{h.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
