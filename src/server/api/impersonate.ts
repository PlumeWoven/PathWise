import { defineEventHandler, readBody, getHeader, createError } from 'h3';
import { createClient } from '@supabase/supabase-js';

// 🔴 TEMPORARY: Hardcode for testing – replace with your actual values
// After it works, we'll fix environment variables.
const SUPABASE_URL = 'https://tarnqywokrildahzhmjv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcm5xeXdva3JpbGRhaHpobWp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3NzI1NSwiZXhwIjoyMDk0MzUzMjU1fQ.Axrf2vnBcP6S-3Ifw0kaI8DrgBqVzU6C2Np-ATMKF-g'; // ← paste your key

export default defineEventHandler(async (event) => {
    // Only allow POST
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    try {
        const body = await readBody(event) as { userId?: string };
        const { userId } = body || {};
        if (!userId) {
            throw createError({ statusCode: 400, statusMessage: 'Missing userId' });
        }

        // Get admin JWT from header
        const authHeader = getHeader(event, 'authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({ statusCode: 401, statusMessage: 'Missing or invalid Authorization header' });
        }
        const adminToken = authHeader.split(' ')[1];

        const supabaseAdmin = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 1. Validate admin
        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
        if (adminError || !adminUser) {
            console.error('Admin validation error:', adminError);
            throw createError({ statusCode: 401, statusMessage: 'Invalid admin token' });
        }
        const role = adminUser.user?.app_metadata?.role;
        if (role !== 'admin') {
            throw createError({ statusCode: 403, statusMessage: 'Not authorized' });
        }

        // 2. Get target user email
        const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetError || !targetUser) {
            console.error('Target user fetch error:', targetError);
            throw createError({ statusCode: 404, statusMessage: 'Target user not found' });
        }
        const email = targetUser.user?.email;
        if (!email) {
            throw createError({ statusCode: 400, statusMessage: 'Target user has no email' });
        }

        // 3. Generate magic link
        const { data: magicLinkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: `${process.env.SITE_URL || 'https://path-wise-seven.vercel.app'}/auth/callback`,
            },
        });
        if (linkError || !magicLinkData) {
            console.error('Magic link generation error:', linkError);
            throw createError({ statusCode: 500, statusMessage: 'Failed to generate magic link' });
        }

        return { magicLink: magicLinkData.properties?.action_link };
    } catch (err: any) {
        console.error('[Impersonate API] Error:', err);
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Internal server error' });
    }
});