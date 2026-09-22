# jumble-frontend

React app for Jumble, built with Vite. See `/docs` at the repo root for the full spec.

## Running it locally

```
npm install
npm run dev
```

Then open the URL it prints (typically `http://localhost:5173`).

This starter page calls the backend's `/api/health` endpoint and shows whether it's reachable — useful as a first check that both halves of the app are running and can talk to each other. The backend needs to be running separately for that to succeed; see `../backend/README.md`.

## Configuration

Copy `.env.example` to `.env.local` if you need to point the frontend at a backend running somewhere other than `http://localhost:8080` (for example, once the backend is deployed to Render). `.env.local` is git-ignored, so it's safe to put machine-specific values there.

## Building for production

```
npm run build
```

Output goes to `dist/`. This is what Vercel runs automatically on deploy.
