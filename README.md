# MelodyMind

A personal project combining music, mood detection and recommendations.

## Tech Stack

- Frontend: React 18 + Vite
  - Key libraries: axios, react-router-dom, face-api.js, meyda, sentiment, chart.js, react-chartjs-2
- Backend: Node.js + Express
  - Key libraries: mongoose (MongoDB), bcrypt, multer, cors, dotenv
- Audio analysis: Python (librosa, numpy, scipy, soundfile)
- Testing: Jest, Supertest, mongodb-memory-server
- Models: face-api.js models included in `public/models/` (client-side)

## Repo structure (important parts)

- `melodymind-frontend/` - React app
  - `package.json`, `vite.config.jsx`, `src/` components and pages
- `melodymind-frontend/melodymind-backend/` - Node backend + Python script
  - `server.js` - main backend server (Express)
  - `mood_genre_detect.py` - audio analysis script (librosa)
  - `requirements.txt` - Python dependencies
  - `package.json` - Node backend deps and scripts
  - `uploads/` - audio uploads (created at runtime)
- `public/models/` - face-api.js model files (client-side)

## Local setup (Windows PowerShell)

Open two terminals (or more): one for backend, one for frontend, and one for Python env if desired.

1. Install Node dependencies

```powershell
# from repo root
cd .\melodymind-frontend
npm install

# backend deps
cd .\melodymind-backend
npm install
```

2. Setup Python environment for audio analysis

```powershell
# using venv
cd .\melodymind-frontend\melodymind-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

Note: On some Windows setups the Python command may be `python3` or simply `python`. Adjust commands accordingly.

3. Environment variables

Create a `.env` file inside `melodymind-backend` with at least:

```
MONGO_URI=mongodb://localhost:27017/melodymind
PORT=5000
PYTHON_CMD=python
```

- `PYTHON_CMD` is optional but recommended if `python3` isn't available on your system. `server.js` currently calls `python3` — set this to `python` on Windows if needed.

4. Run MongoDB

- You can use a local MongoDB server or a cloud MongoDB Atlas connection via `MONGO_URI`.

5. Start backend and frontend

```powershell
# backend
cd .\melodymind-frontend\melodymind-backend
npm run start

# frontend (new terminal)
cd .\melodymind-frontend
npm run dev
```

The frontend dev server typically runs at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Notes & Troubleshooting

- Python detection: `server.js` spawns `python3` to run `mood_genre_detect.py`. On Windows, ensure the `PYTHON_CMD` in `.env` matches your Python executable name. If you want, I can patch `server.js` to use `process.env.PYTHON_CMD || 'python3'`.
- If face detection models fail to load, check that `public/models/` is served correctly by the frontend.
- For production deployment consider containerizing backend + python script, or moving audio analysis to a separate service to avoid blocking the Node process.

---
If you'd like, I can now:

- Add a small `TECH_STACK.md` with the same content,
- Patch `server.js` to respect `PYTHON_CMD` env var and fallback to `python` if `python3` isn't available,
- Or create a `docker-compose.yml` to run Node + MongoDB + Python container for local dev.

Which follow-up would you like me to do next?