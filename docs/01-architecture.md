# Architecture & Tech Stack

## High-Level Architecture

Vercel (Production)
├── Static SPA (assets/)
└── Nitro Server (SSR + /api/* routes)
│
▼
Supabase (Backend)
├── PostgreSQL (tables)
├── Auth (JWT)
└── Storage (buckets)


## Tech Stack
| Layer              | Technology                        | Notes                                   |
|--------------------|-----------------------------------|-----------------------------------------|
| Frontend           | Vite + React SPA                  | Vite 7.3.5, React 19                    |
| Routing            | TanStack Router                   | File‑based, 1.168.0                      |
| UI                 | Tailwind CSS + shadcn/ui          | Custom glassmorphic tokens (`pw-*`)      |
| State              | Zustand (only for quiz)           | Lightweight global store                |
| Package Manager    | Bun (local), npm (Vercel)         | Bun for dev, npm for builds             |
| Backend / DB       | Supabase                          | Postgres, Auth, Storage, Realtime       |
| Hosting            | Vercel (frontend + serverless)    | Static SPA + Nitro SSR for API routes  |
| Auth               | Supabase Auth                     | Email/password, Google, magic links    |
| Animations         | Framer Motion                     | Used for dark mode wave toggle, confetti|

## Data Flow Principles
- All Supabase calls go through `src/pathwise/api.ts`.
- Never import `supabase` directly in route files.
- Zustand only for quiz state; everything else uses React hooks.