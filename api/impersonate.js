// api/impersonate.js
//
// Mints a magic link so an admin can sign in as another user.
//
// Runs with the Supabase service-role key, which bypasses RLS entirely — so the
// caller is verified twice before it is used: the bearer token must resolve to a
// real user, and that user must carry `app_metadata.role === "admin"`. The role
// lives in app_metadata specifically because users cannot edit it themselves
// (unlike user_metadata or the profiles table).
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Absolute origin to send the magic link back to.
 *
 * Derived from the request rather than hardcoded so the endpoint works on
 * localhost, on Vercel preview deployments, and in production alike — a fixed
 * production URL meant impersonating from localhost bounced you to prod.
 */
function resolveOrigin(req) {
    const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
    if (!forwardedHost) return null;
    const proto =
        req.headers['x-forwarded-proto'] ||
        (forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1') ? 'http' : 'https');
    return `${proto}://${forwardedHost}`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[Impersonate] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        return res.status(500).json({ error: 'Server is not configured for impersonation' });
    }

    try {
        const { userId } = req.body ?? {};
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }
        const adminToken = authHeader.split(' ')[1];

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
        if (adminError || !adminUser?.user) {
            console.error('[Impersonate] Admin validation error:', adminError);
            return res.status(401).json({ error: 'Invalid admin token' });
        }

        // Mirrors isAdmin() in src/pathwise/roles.ts.
        if (adminUser.user.app_metadata?.role !== 'admin') {
            console.error('[Impersonate] Caller is not an admin:', adminUser.user.id);
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetError || !targetUser?.user) {
            console.error('[Impersonate] Target user error:', targetError);
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Refuse to impersonate another admin — that would let one admin take over
        // another's account without it showing up as a sign-in they performed.
        if (targetUser.user.app_metadata?.role === 'admin') {
            return res.status(403).json({ error: 'Cannot impersonate another admin' });
        }

        const email = targetUser.user.email;
        if (!email) {
            return res.status(400).json({ error: 'Target user has no email' });
        }

        const origin = resolveOrigin(req);
        if (!origin) {
            return res.status(400).json({ error: 'Could not determine request origin' });
        }

        const { data: magicLinkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: `${origin}/auth/callback` },
        });
        if (linkError || !magicLinkData) {
            console.error('[Impersonate] Magic link error:', linkError);
            return res.status(500).json({ error: 'Failed to generate magic link' });
        }

        console.warn(`[Impersonate] admin=${adminUser.user.id} target=${userId} origin=${origin}`);
        return res.status(200).json({ magicLink: magicLinkData.properties?.action_link });
    } catch (err) {
        console.error('[Impersonate] Unhandled error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
