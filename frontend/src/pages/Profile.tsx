import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import IssueCard from "../components/IssueCard";

export default function Profile() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  useEffect(() => {
    api.get("/api/issues").then((all) => setIssues(all.filter((i: any) => i.reporter_id === user?.id))).catch(() => {});
  }, [user]);

  if (!user) return null;
  const level = Math.floor(user.points / 100) + 1;
  const nextLevel = level * 100;
  const pct = Math.min(100, (user.points / nextLevel) * 100);
  const badges: string[] = [];
  if (user.points >= 10) badges.push("🌱 Starter");
  if (user.points >= 50) badges.push("📣 Reporter");
  if (user.points >= 100) badges.push("⭐ Champion");
  if (user.points >= 200) badges.push("🏆 Hero");
  if (issues.length >= 5) badges.push("🔥 Active");

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="card gradient" style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ fontSize: 60 }}>👤</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ margin: "4px 0" }}>{user.email} · {user.role.toUpperCase()} · {user.ward || "—"}</p>
          <div style={{ marginTop: 10 }}>
            <strong>Level {level}</strong> · {user.points} / {nextLevel} XP
            <div className="progress" style={{ marginTop: 6 }}><div style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🏅 Badges</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {badges.length === 0 && <span className="muted">No badges yet — start reporting!</span>}
          {badges.map((b) => <span key={b} className="badge" style={{ fontSize: 14, padding: "8px 14px" }}>{b}</span>)}
        </div>
      </div>

      <h3>My Reports ({issues.length})</h3>
      <div className="grid cols-3">
        {issues.map((i) => <IssueCard key={i.id} issue={i} />)}
      </div>
    </div>
  );
}
