// api/impersonate.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tarnqywokrildahzhmjv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcm5xeXdva3JpbGRhaHpobWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3NzI1NSwiZXhwIjoyMDk0MzUzMjU1fQ.Axrf2vnBcP6S-3Ifw0kaI8DrgBqVzU6C2Np-ATMKF-g'; // ← paste your key

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;
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

        // 🔴 TEMPORARY: Hardcode admin email for testing
        const ADMIN_EMAIL = 'inistorica1@gmail.com'; // your admin email

        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
        if (adminError || !adminUser) {
            console.error('[Impersonate] Admin validation error:', adminError);
            return res.status(401).json({ error: 'Invalid admin token' });
        }

        // Check email instead of app_metadata.role
        if (adminUser.user?.email !== ADMIN_EMAIL) {
            console.error('[Impersonate] Not admin email:', adminUser.user?.email);
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get target user
        const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetError || !targetUser) {
            console.error('[Impersonate] Target user error:', targetError);
            return res.status(404).json({ error: 'Target user not found' });
        }
        const email = targetUser.user?.email;
        if (!email) {
            return res.status(400).json({ error: 'Target user has no email' });
        }

        // Generate magic link
        const { data: magicLinkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: 'https://path-wise-seven.vercel.app/auth/callback',
            },
        });
        if (linkError || !magicLinkData) {
            console.error('[Impersonate] Magic link error:', linkError);
            return res.status(500).json({ error: 'Failed to generate magic link' });
        }

        return res.status(200).json({ magicLink: magicLinkData.properties?.action_link });
    } catch (err) {
        console.error('[Impersonate] Unhandled error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}