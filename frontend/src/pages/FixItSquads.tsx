import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function FixItSquads() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    ward: "",
    type: "official"
  });
  const load = () => api.get("/api/community/squads").then(setRows).catch(() => { });
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    await api.postForm("/api/community/squads", fd);
    setForm({
      name: "",
      description: "",
      ward: "",
      type: "official"
    }); load();
  };
  const join = async (id: number) => { await api.post(`/api/community/squads/${id}/join`); load(); };
  const leave = async (id: number) => {

    await api.post(
      `/api/community/squads/${id}/leave`
    );

    load();

  }

  const removeSquad = async (id: number) => {

    if (!window.confirm("Delete this squad permanently?")) {
      return;
    }

    await api.delete(`/api/community/squads/${id}`);

    load();
  }

  const createdSquads = rows.filter(
    s => s.leader_id === user?.id
  );

  const mySquads = rows.filter(
    s => s.joined && s.leader_id !== user?.id
  );

  const otherSquads = rows.filter(
    s => !s.joined && s.leader_id !== user?.id
  );
  return (
    <div className="container">
      <h2>
        {
          user?.role === "authority"
            ? "🏛 Official Response Squads"
            : user?.role === "contractor"
              ? "👷 Official Response Teams"
              : "🤝 Community Volunteer Squads"
        }
      </h2>
      <p>
        {
          user?.role === "authority"
            ? "Create and manage official municipal response teams."
            : user?.role === "contractor"
              ? "Join official municipal response teams and help resolve civic issues."
              : "Join community volunteer squads and contribute to your city."
        }
      </p>
      {user?.role === "contractor" && (
        <>
          <h3 style={{ marginTop: 20 }}>
            My Team
          </h3>

          <div className="grid cols-3">
            {mySquads.map((s) => (
              <div key={s.id} className="card">
                <h3>{s.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span className={`badge ${s.type === "official" ? "high" : "low"}`}>
                    {s.type === "official"
                      ? "🏛 Official"
                      : "🤝 Volunteer"}
                  </span>
                </div>
                <p style={{ fontSize: 13 }}>{s.description || <em className="muted">No description</em>}</p>
                <div className="muted" style={{ fontSize: 12 }}>Ward: {s.ward || "—"} · 👥 {s.members} members · Leader: {s.leader_name}</div>
                {user && (
                  s.leader_id !== user?.id && (
                    s.joined ? (
                      <button
                        className="btn danger sm"
                        style={{ marginTop: 10 }}
                        onClick={() => leave(s.id)}
                      >
                        Leave Squad
                      </button>
                    ) : (
                      <button
                        className="btn sm"
                        style={{ marginTop: 10 }}
                        onClick={() => join(s.id)}
                      >
                        Join
                      </button>
                    )
                  )
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {user?.role === "authority" && (
        <>
          <h3 style={{ marginTop: 30 }}>
            My Official Teams
          </h3>

          <div className="grid cols-3">

            {createdSquads.map((s) => (

              <div key={s.id} className="card">

                <h3>{s.name}</h3>

                <p>{s.description}</p>

                <div className="muted">

                  Ward {s.ward}

                </div>

                <button
                  className="btn danger sm"
                  style={{ marginTop: 10 }}
                  onClick={() => removeSquad(s.id)}
                >
                  Delete Squad
                </button>

              </div>

            ))}

          </div>
        </>
      )}
      {user?.role !== "authority" && (
        <>
          <h3 style={{ marginTop: 30 }}>Available Official Teams</h3>

          <div className="grid cols-3">
            {otherSquads.map((s) => (
              <div key={s.id} className="card">
                <h3>{s.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span className={`badge ${s.type === "official" ? "high" : "low"}`}>
                    {s.type === "official"
                      ? "🏛 Official"
                      : "🤝 Volunteer"}
                  </span>
                </div>
                <p style={{ fontSize: 13 }}>{s.description || <em className="muted">No description</em>}</p>
                <div className="muted" style={{ fontSize: 12 }}>
                  Ward: {s.ward || "—"} · 👥 {s.members} members · Leader: {s.leader_name}
                </div>

                {s.leader_id === user?.id ? (
                  <button
                    className="btn danger sm"
                    style={{ marginTop: 10 }}
                    onClick={() => removeSquad(s.id)}
                  >
                    Delete Team
                  </button>
                ) : s.joined ? (
                  <button
                    className="btn danger sm"
                    style={{ marginTop: 10 }}
                    onClick={() => leave(s.id)}
                  >
                    Leave Team
                  </button>
                ) : (
                  <button
                    className="btn sm"
                    style={{ marginTop: 10 }}
                    onClick={() => join(s.id)}
                  >
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {user?.role === "authority" && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>
              Create Official Team
          </h3>
          <form onSubmit={create}>
            <input placeholder="Squad name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea placeholder="What will you do?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginTop: 8 }} />
            <input placeholder="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} style={{ marginTop: 8 }} />
            
            <button className="btn" style={{ marginTop: 12 }}>Create Team</button>
          </form>
        </div>
      )}
    </div>
  );
}
