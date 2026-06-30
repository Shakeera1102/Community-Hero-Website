import { useEffect, useState } from "react";
import { api } from "../api";

export default function Leaderboard() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/api/gamification/leaderboard").then(setRows).catch(() => {}); }, []);
  return (
    <div className="container">
      <h2>🏆 Citizen Leaderboard</h2>
      <p>Top community heroes by contribution points.</p>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Rank</th><th>Name</th><th>Ward</th><th>Badge</th><th>Points</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>#{r.rank}</strong></td>
                <td>{r.name}</td><td>{r.ward || "—"}</td>
                <td>{r.badge}</td>
                <td><strong>{r.points}</strong></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 20 }}>No users yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
