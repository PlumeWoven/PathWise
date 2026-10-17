// api/keepalive.js
//
// Free-plan Supabase projects pause after about a week without activity — that
// took the site down on 2026-10-03. A daily GitHub Action calls this endpoint,
// which makes one cheap read so the project stays awake. It doubles as an
// uptime check: 200 means the site and the database both answer.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async function handler(_req, res) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ ok: false, error: 'Supabase is not configured' });
    }
    try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        return res.status(r.ok ? 200 : 502).json({ ok: r.ok, db: r.status });
    } catch {
        return res.status(502).json({ ok: false, error: 'Supabase unreachable' });
    }
}
