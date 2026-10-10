// api/impersonate.js
//
// Mints a magic link so an admin can sign in as another user.
//
// Runs with the Supabase service-role key, which bypasses RLS entirely — so the
// caller is verified twice before it is used: the bearer token must resolve to a
// real user, and that user must carry `app_metadata.role === "admin"`. The role
// lives in app_metadata specifically because users cannot edit it themselves
// (unlike user_metadata or the profiles table).
import { requireAdminForTarget } from './_admin.js';

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
    const ctx = await requireAdminForTarget(req, res, 'Impersonate');
    if (!ctx) return;
    const { supabaseAdmin, admin, target } = ctx;

    try {
        const email = target.email;
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

        // Audit trail (service role bypasses RLS; admins can read it).
        const { error: logError } = await supabaseAdmin
            .from('impersonation_logs')
            .insert({ admin_id: admin.id, target_id: target.id, origin });
        if (logError) console.error('[Impersonate] Audit log failed:', logError);
        console.warn(`[Impersonate] admin=${admin.id} target=${target.id} origin=${origin}`);
        // Return the token hash, not the action_link: the browser client uses the
        // PKCE flow, which rejects the #access_token fragment the link redirects with.
        // The client exchanges this hash with supabase.auth.verifyOtp instead.
        return res.status(200).json({ tokenHash: magicLinkData.properties?.hashed_token });
    } catch (err) {
        console.error('[Impersonate] Unhandled error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
