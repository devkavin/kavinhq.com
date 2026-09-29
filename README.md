# KAVINHQ

KAVINHQ is Kavin's public portfolio and project manager. It combines a React 18 and Vite frontend with a FastAPI API and an externally hosted MySQL database.

## Native development

Requirements: Node 20, Yarn 1 through Corepack, and Python 3.11 or newer.

1. Copy `.env.example` to `.env` and fill in every value.
2. Install the backend packages with `python -m pip install -r backend/requirements-dev.txt`.
3. Start the API from `backend` with `uvicorn server:app --reload --port 8001`.
4. Install the frontend packages with `corepack yarn --cwd frontend install --frozen-lockfile`.
5. Start Vite with `corepack yarn --cwd frontend dev` and set `VITE_API_BASE=http://localhost:8001` in `frontend/.env.local`.

The public site is available at `http://localhost:5173`. The admin login is at `http://localhost:5173/admin`.

## Tests

Run backend checks with `python -m pytest backend/tests -v` and frontend checks with `corepack yarn --cwd frontend test --run`. Build the frontend with `corepack yarn --cwd frontend build`.

With the API running, execute `powershell -ExecutionPolicy Bypass -File scripts/verify-api.ps1` to check authentication, project CRUD, settings, cleanup, and the unauthenticated write path. With both development servers running, execute `node scripts/verify-ui.mjs` to validate every public page and admin state at 1440 by 900 and 390 by 844. Screenshots are written to `artifacts/screenshots` and ignored by Git.

## Docker compose

Copy `.env.example` to `.env`, provide the hosted MySQL URL and secrets, then run `docker compose up --build`. The public site is served at `http://localhost`.

For the local admin workflow, run `docker compose -f docker-compose.admin.yml up --build` and open `http://localhost:8081/admin`.

See [DEPLOY.md](DEPLOY.md) for Coolify setup, environment details, MySQL TLS examples, and production security guidance.
