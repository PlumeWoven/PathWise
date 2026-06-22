// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    // Get the admin's JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const adminToken = authHeader.split(' ')[1];

    // Create Supabase admin client using service role key (from env)
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Validate that the requester is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.getUser(adminToken);
    if (adminError || !adminUser) {
        return res.status(401).json({ error: 'Invalid admin token' });
    }
    const role = adminUser.user?.app_metadata?.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
    }

    // 2. Get the target user's email
    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetError || !targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
    }
    const email = targetUser.user?.email;
    if (!email) {
        return res.status(400).json({ error: 'Target user has no email' });
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
        return res.status(500).json({ error: 'Failed to generate magic link' });
    }

    // 4. Return the magic link URL
    return res.status(200).json({ magicLink: magicLinkData.properties?.action_link });
}