// api/admin-user.js
//
// Suspends or restores a user. Suspending bans the auth account (they can't
// sign in; an open session lasts until its token expires, ≤1 hour), stamps
// profiles.suspended_at for the admin list, and unverifies tutors so they drop
// out of search. Restoring lifts the ban; re-verify tutors by hand.
import { requireAdminForTarget } from './_admin.js';

export default async function handler(req, res) {
    const ctx = await requireAdminForTarget(req, res, 'AdminUser');
    if (!ctx) return;
    const { supabaseAdmin, admin, target } = ctx;

    const { action } = req.body ?? {};
    if (action !== 'suspend' && action !== 'restore') {
        return res.status(400).json({ error: 'action must be "suspend" or "restore"' });
    }

    try {
        const suspend = action === 'suspend';
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(target.id, {
            ban_duration: suspend ? '876000h' : 'none',
        });
        if (banError) throw banError;

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(
                suspend
                    ? { suspended_at: new Date().toISOString(), verification_status: 'unverified' }
                    : { suspended_at: null },
            )
            .eq('id', target.id);
        if (profileError) throw profileError;

        console.warn(`[AdminUser] admin=${admin.id} ${action} target=${target.id}`);
        return res.status(200).json({ ok: true, suspended: suspend });
    } catch (err) {
        console.error('[AdminUser] Unhandled error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
