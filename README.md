# massage_chatbot-web

Vite + React + TypeScript + Tailwind shell for the new frontend. It talks to the existing Python backend (`server_qwen.py`) through REST, or falls back to a built-in mock API during frontend-only development.

## Quick start

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE to your backend
npm run dev
```

Set `VITE_USE_MOCKS=true` in `.env.local` to simulate `/api/sessions` and `/api/robot/status` without the Python service. Vite also proxies `/api` to `http://localhost:8000` by default (see `vite.config.ts`).

## Backend (minimal FastAPI stub)

The web repo includes a lightweight backend under `backend/` (separate from the legacy repo):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Keep `VITE_API_BASE=http://localhost:8000` in `.env.local`. Endpoints: `/api/sessions` (create/start/stop/status/chat/logs) and `/api/robot/status`, matching the mock contracts.

## Structure (M0)

- `src/app` – App shell, router, providers
- `src/shared` – UI primitives, lib utilities, zod schemas
- `src/features/session|robot|tts|logs` – Domain features
- `src/mocks/mockApi.ts` – in-memory mock of server_qwen endpoints

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – typecheck and build
- `npm run lint` – eslint
- `npm run typecheck` – `tsc -b`
