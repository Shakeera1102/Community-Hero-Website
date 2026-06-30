import { Link } from "react-router-dom";
import { api } from "../api";

export default function IssueCard({ issue }: { issue: any }) {
  const img = issue.image_url ? api.asset(issue.image_url) : "";
  return (
    <Link to={`/issues/${issue.id}`} className="issue-card" style={{ display: "block" }}>
      <div className="thumb" style={img ? { backgroundImage: `url(${img})` } : {}}>
        {!img && <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: .25 }}>🏙️</div>}
      </div>
      <div className="body">
        <h3>{issue.title}</h3>
        <div className="muted" style={{ fontSize: 12 }}>
          {issue.category} · {issue.ward || "—"} · 👍 {issue.upvotes}
        </div>
        <div className="row">
          {issue.severity && <span className={`badge ${issue.severity}`}>{issue.severity}</span>}
          <span className={`badge ${issue.status}`}>{issue.status}</span>
        </div>
      </div>
    </Link>
  );
}
