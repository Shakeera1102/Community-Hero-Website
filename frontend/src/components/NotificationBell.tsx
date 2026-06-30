import { useEffect, useState } from "react";
import { api } from "../api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = () => api.get("/api/notifications").then(setItems).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <div className="notif-bell" onClick={() => setOpen(!open)}>
        🔔 {items.length > 0 && <span className="dot" />}
      </div>
      {open && (
        <div className="notif-panel">
          {items.length === 0 && <div className="notif-item"><div className="bd">No notifications</div></div>}
          {items.map((n, i) => (
            <div key={i} className="notif-item">
              <div className="ico">{n.icon}</div>
              <div>
                <div className="ttl">{n.title}</div>
                <div className="bd">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
