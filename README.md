# Community Hero AI — v2.0

Hyperlocal civic intelligence platform. **React + Vite** frontend, **Python FastAPI** backend, **Google Gemini** for all AI.

```
community-hero-ai/
├── backend/        # Python · FastAPI · SQLite · Gemini
└── frontend/       # React · TypeScript · Vite · Leaflet · i18n
```

## What's inside

- 🧠 **Gemini** triage, before/after verify, recurrence prediction, predictive hotspots, voice transcription, AI assistant chat
- 🗺️ **Real Leaflet map** with OpenStreetMap tiles, color-coded severity
- 🌐 **5 languages** — English, Hindi, Telugu, Tamil, Kannada
- 🎤 **Voice reporting** (browser MediaRecorder → Gemini)
- 👥 **Three roles** — Citizen, Municipal Officer, Contractor
- 🔔 Notifications · 💬 AI Assistant · 🏘️ Ward Health · 💰 Budget · 🏆 Leaderboard · 🤝 Fix-It Squads

---

## 1. Backend Setup (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env → paste your Google AI Studio key into GOOGLE_API_KEY=
# Get one free: https://aistudio.google.com/apikey

uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** · Swagger docs at **http://localhost:8000/docs**

### Where to put what

| Thing                | File                              |
| -------------------- | --------------------------------- |
| 🔑 **API keys**       | `backend/.env`                     |
| 🤖 Gemini models     | `backend/config.py` (`VISION_MODEL`, `TEXT_MODEL`) |
| 📦 **All AI logic**   | `backend/services/gemini.py`       |
| 🗄️ Database schema   | `backend/services/db.py`           |
| 🔌 API routes        | `backend/routers/*.py`             |
| 📤 File uploads      | `backend/uploads/` (auto-created)  |
| 🔐 JWT secret        | `backend/.env` → `JWT_SECRET`      |

---

## 2. Frontend Setup (React)

```bash
cd frontend
npm install
cp .env.example .env
# Edit if backend is not on localhost:8000
npm run dev
```

Frontend runs at **http://localhost:5173**

| Thing            | File                                      |
| ---------------- | ----------------------------------------- |
| Backend URL      | `frontend/.env` → `VITE_API_URL`           |
| API wrapper      | `frontend/src/api.ts`                      |
| Auth context     | `frontend/src/auth.tsx`                    |
| Translations     | `frontend/src/i18n.tsx` (en/hi/te/ta/kn)   |
| Pages            | `frontend/src/pages/`                      |
| Components       | `frontend/src/components/`                 |
| Theme/styles     | `frontend/src/styles.css`                  |

---

## 3. End-to-End Flow

1. **Signup** as Citizen / Officer / Contractor
2. **Report** with photo + voice + text (any language)
3. **Gemini** classifies category, severity, department, language
4. **Duplicates** auto-merge by category + geo proximity
5. **Citizens verify/upvote** → status moves `reported → verified`
6. **Officer** sees verified queue and assigns a contractor → `assigned`
7. **Contractor** uploads AFTER photo → Gemini compares → `resolved` or `rejected`
8. **Recurrence risk** predicted (30/60/90 days)
9. **Ward score**, **Contractor score**, **Predictive hotspots**, **Budget**, **Leaderboard** all update live
10. **AI Assistant** (floating 💬) answers civic questions in the user's language
11. **Notifications** keep everyone in the loop

---

## 4. Production Notes

- Swap SQLite → Postgres in `backend/services/db.py`
- Swap local uploads → S3/GCS in `backend/services/storage.py`
- Tighten CORS in `backend/main.py`
- Set a strong `JWT_SECRET`
- Build frontend: `npm run build` → serve `dist/` behind any static host
