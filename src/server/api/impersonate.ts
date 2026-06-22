import { defineEventHandler, readBody, getHeader, createError } from 'h3';
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    // Only allow POST
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    const body = await readBody(event) as { userId?: string };
    const { userId } = body || {};
    if (!userId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing userId' });
    }

    // Get the admin's JWT from the Authorization header
    const authHeader = getHeader(event, 'authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, statusMessage: 'Missing or invalid Authorization header' });
    }
    const adminToken = authHeader.split(' ')[1];

    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Validate that the requester is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
    if (adminError || !adminUser) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid admin token' });
    }
    const role = adminUser.user?.app_metadata?.role;
    if (role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Not authorized' });
    }

    // 2. Get the target user's email
    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetError || !targetUser) {
        throw createError({ statusCode: 404, statusMessage: 'Target user not found' });
    }
    const email = targetUser.user?.email;
    if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Target user has no email' });
    }

    // 3. Generate a magic link for the target user
    const { data: magicLinkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo: `${process.env.SITE_URL}/auth/callback`,
        },
    });
    if (linkError || !magicLinkData) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to generate magic link' });
    }

    // 4. Return the magic link URL
    return { magicLink: magicLinkData.properties?.action_link };
});