import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { api } from "../api";

// fix default marker icon (Leaflet + Vite issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEV_COLOR: Record<string, string> = {
  low: "#34d399", medium: "#fbbf24", high: "#f87171", critical: "#ef4444",
};

export default function MapView() {
  const [issues, setIssues] = useState<any[]>([]);
  useEffect(() => { api.get("/api/issues").then(setIssues).catch(() => {}); }, []);

  const pts = issues.filter((i) => i.lat && i.lng);
  // default to Hyderabad if no points
  const center: [number, number] = pts.length
    ? [pts[0].lat, pts[0].lng]
    : [17.385, 78.4867];

  return (
    <div className="container">
      <h2>🗺️ Live Issue Map</h2>
      <p>Real-time, hyperlocal view of every reported civic issue. Click any pin for details.</p>

      <MapContainer center={center} zoom={pts.length ? 13 : 12} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pts.map((p) => (
          <CircleMarker key={p.id} center={[p.lat, p.lng]}
            radius={10 + (p.upvotes || 0)}
            pathOptions={{ color: SEV_COLOR[p.severity] || "#6c8cff",
                           fillColor: SEV_COLOR[p.severity] || "#6c8cff", fillOpacity: 0.65 }}>
            <Popup>
              <strong>{p.title}</strong><br />
              <span className={`badge ${p.severity}`}>{p.severity}</span> · {p.category}<br />
              👍 {p.upvotes} · {p.status}<br />
              <Link to={`/issues/${p.id}`}>Open →</Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="card" style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span><span className="badge low">low</span></span>
        <span><span className="badge medium">medium</span></span>
        <span><span className="badge high">high</span></span>
        <span><span className="badge critical">critical</span></span>
        <span className="muted" style={{ marginLeft: "auto" }}>Pin size = community upvotes</span>
      </div>
    </div>
  );
}
