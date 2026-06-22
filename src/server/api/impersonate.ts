import { defineEventHandler, readBody, getHeader, createError } from 'h3';
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    try {
        const body = await readBody(event) as { userId?: string };
        const { userId } = body || {};
        if (!userId) {
            throw createError({ statusCode: 400, statusMessage: 'Missing userId' });
        }

        const authHeader = getHeader(event, 'authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({ statusCode: 401, statusMessage: 'Missing or invalid Authorization header' });
        }
        const adminToken = authHeader.split(' ')[1];

        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
        if (adminError || !adminUser) {
            console.error('Admin validation error:', adminError);
            throw createError({ statusCode: 401, statusMessage: 'Invalid admin token' });
        }
        const role = adminUser.user?.app_metadata?.role;
        if (role !== 'admin') {
            throw createError({ statusCode: 403, statusMessage: 'Not authorized' });
        }

        const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetError || !targetUser) {
            console.error('Target user fetch error:', targetError);
            throw createError({ statusCode: 404, statusMessage: 'Target user not found' });
        }
        const email = targetUser.user?.email;
        if (!email) {
            throw createError({ statusCode: 400, statusMessage: 'Target user has no email' });
        }

        const { data: magicLinkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: `${process.env.SITE_URL}/auth/callback`,
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