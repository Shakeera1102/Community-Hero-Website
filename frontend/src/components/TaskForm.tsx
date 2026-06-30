import { useEffect, useState } from "react";
import { api } from "../api";

type Props = {
  onCreated: () => void;
};

export default function TaskForm({ onCreated }: Props) {

  const [squads, setSquads] = useState<any[]>([]);

  const [form, setForm] = useState({
    squad_id: "",
    title: "",
    description: "",
    location: "",
    due_date: "",
    priority: "Medium"
  });

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {

      const data = await api.get("/api/community/squads");

      // Only official squads
      setSquads(
        data.filter((s: any) => s.type === "official")
      );

    } catch (err) {
      console.log(err);
    }
  };

  const createTask = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const fd = new FormData();

      fd.append("squad_id", form.squad_id);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("location", form.location);
      fd.append("due_date", form.due_date);
      fd.append("priority", form.priority);

      await api.postForm(
        "/api/maintenance/tasks",
        fd
      );

      alert("Maintenance Task Created");

      setForm({
        squad_id: "",
        title: "",
        description: "",
        location: "",
        due_date: "",
        priority: "Medium"
      });

      onCreated();

    } catch (err) {

      console.log(err);

      alert("Unable to create task.");

    }

  };

  return (

    <div className="card">

      <h3>Create Maintenance Task</h3>

      <form onSubmit={createTask}>

        <input
          placeholder="Task Title"
          required
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value
            })
          }
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value
            })
          }
          style={{ marginTop: 10 }}
        />

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({
              ...form,
              location: e.target.value
            })
          }
          style={{ marginTop: 10 }}
        />

        <input
          type="date"
          value={form.due_date}
          onChange={(e) =>
            setForm({
              ...form,
              due_date: e.target.value
            })
          }
          style={{ marginTop: 10 }}
        />

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({
              ...form,
              priority: e.target.value
            })
          }
          style={{ marginTop: 10 }}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <select
          required
          value={form.squad_id}
          onChange={(e) =>
            setForm({
              ...form,
              squad_id: e.target.value
            })
          }
          style={{ marginTop: 10 }}
        >
          <option value="">Assign Squad</option>

          {squads.map((s) => (

            <option
              key={s.id}
              value={s.id}
            >
              {s.name}
            </option>

          ))}

        </select>

        <button
          className="btn"
          style={{ marginTop: 15 }}
        >
          Create Task
        </button>

      </form>

    </div>

  );

}