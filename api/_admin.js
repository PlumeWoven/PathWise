// api/_admin.js
//
// Shared guard for the admin endpoints (the leading underscore keeps Vercel
// from exposing this file as a route).
//
// These endpoints run with the service-role key, which bypasses RLS entirely,
// so the caller is verified first: the bearer token must resolve to a real
// user whose `app_metadata.role` is "admin" (users can't edit app_metadata).
// Admin accounts are never valid targets.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validates a POST { userId } from an admin. On failure it sends the error
 * response and returns null; on success it returns the service-role client,
 * the calling admin and the target user.
 */
export async function requireAdminForTarget(req, res, tag) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return null;
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error(`[${tag}] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`);
        res.status(500).json({ error: 'Server is not configured for admin actions' });
        return null;
    }

    const { userId } = req.body ?? {};
    if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return null;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return null;
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(authHeader.split(' ')[1]);
    if (callerError || !caller?.user) {
        console.error(`[${tag}] Admin validation error:`, callerError);
        res.status(401).json({ error: 'Invalid admin token' });
        return null;
    }
    // Mirrors isAdmin() in src/pathwise/roles.ts.
    if (caller.user.app_metadata?.role !== 'admin') {
        console.error(`[${tag}] Caller is not an admin:`, caller.user.id);
        res.status(403).json({ error: 'Not authorized' });
        return null;
    }

    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetError || !target?.user) {
        console.error(`[${tag}] Target user error:`, targetError);
        res.status(404).json({ error: 'Target user not found' });
        return null;
    }
    // One admin must not be able to act as, or lock out, another.
    if (target.user.app_metadata?.role === 'admin') {
        res.status(403).json({ error: 'Admins cannot be targeted' });
        return null;
    }

    return { supabaseAdmin, admin: caller.user, target: target.user };
}
