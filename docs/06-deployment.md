# Deployment

- **Vercel (Production):** Build command `npm run build`; output `.vercel/output`; environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`.
- **Local Dev:** `bun install` + `bun run dev` (Vite, no API). For API routes (impersonation): `npm run build && npm run preview` (Nitro server) – visit `http://localhost:4173`.
- **Supabase:** Project ID `tarnqywokrildahzhmjv`; storage buckets: `profile-photos`, `tutor-videos`, `course-assets`, `verification-documents` (private).