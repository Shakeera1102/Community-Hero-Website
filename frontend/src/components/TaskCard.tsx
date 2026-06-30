type Props = {
  task: any;
};

export default function TaskCard({ task }: Props) {
  return (
    <div className="card">

      <h3>{task.title}</h3>

      <p>{task.description || "No description"}</p>

      <div className="muted">
        📍 {task.location || "-"}
      </div>

      <div className="muted">
        👥 {task.squad_name}
      </div>

      <div className="muted">
        🏙 Ward {task.ward || "-"}
      </div>

      <div className="muted">
        📅 Due : {task.due_date || "-"}
      </div>

      <div style={{ marginTop: 12 }}>

        <span
          className={`badge ${
            task.priority === "High"
              ? "high"
              : task.priority === "Medium"
              ? "medium"
              : "low"
          }`}
        >
          {task.priority}
        </span>

        <span
          style={{
            marginLeft: 10
          }}
          className="badge"
        >
          {task.status}
        </span>

      </div>

    </div>
  );
}