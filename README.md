# Jumble

A personalized kids' activity recommender that only suggests things you can actually do right now, with what you already have on hand. Built to showcase backend engineering — a real relational schema, a transparent weighted-scoring recommendation algorithm, and a genuinely explainable "why this suggestion" feature — alongside a React frontend.

## Why this project exists

Most kids'-activity apps are static lists or paid-class finders. Jumble learns each child's preferences from feedback over time and filters live on constraints — age, time available, mess tolerance, indoor/outdoor, and materials the household actually has — rather than handing back a generic list. Full reasoning, competitive positioning, and the differentiators are in `docs/jumble-spec.md`.

## Stack

| Layer | Choice |
|---|---|
| Backend | Java + Spring Boot |
| Database | PostgreSQL (Neon) |
| Frontend | React (Vite) |
| API hosting | Render |
| Frontend hosting | Vercel |
| Images | Cloudinary |
| Weather | Open-Meteo |

Full reasoning for every choice, including the $0-hosting plan, is in `docs/jumble-spec.md`.

## Repository layout

```
jumble/
├── docs/               Project spec and database schema — the source of truth
│   ├── jumble-spec.md
│   └── jumble-schema.md
├── backend/            Spring Boot API (see backend/README.md to get started)
└── frontend/           React app (see frontend/README.md to get started)
```

## Getting started

See `backend/README.md` and `frontend/README.md` for how to run each half locally.

## Status

Planning and initial scaffolding. See `docs/jumble-spec.md` for the full feature roadmap.
