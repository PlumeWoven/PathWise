import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
    component: AdminUsers,
});

function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
            setUsers(data || []);
            setLoading(false);
        })();
    }, []);

    const handleImpersonate = async (userId: string, userName: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const adminToken = session?.access_token;
            if (!adminToken) {
                toast.error("Not authenticated");
                return;
            }

            setImpersonating(userId);

            const response = await fetch('/api/impersonate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ userId }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse response as JSON. Raw text:', text);
                throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
            }

            if (!response.ok) {
                const errorMsg = data.error || data.message || `Request failed (${response.status})`;
                throw new Error(errorMsg);
            }

            const { magicLink } = data;
            if (!magicLink) {
                throw new Error('No magic link returned from server');
            }

            // Store admin info for exit (including access token)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                localStorage.setItem('admin_user_id', user.id);
                localStorage.setItem('admin_email', user.email || '');
                localStorage.setItem('admin_access_token', adminToken);
            }

            localStorage.setItem('impersonating', 'true');
            localStorage.setItem('impersonating_user_name', userName);

            // 🔥 Sign out admin and wait for it to complete
            await supabase.auth.signOut();
            // Small delay to ensure session is cleared
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirect to magic link
            window.location.href = magicLink;
        } catch (err: any) {
            console.error('Impersonation error:', err);
            toast.error(err.message || 'Impersonation failed');
            setImpersonating(null);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Users</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-[var(--pw-border)]">
                        <tr>
                            <th className="text-left py-2">Name</th>
                            <th className="text-left py-2">Email</th>
                            <th className="text-left py-2">Role</th>
                            <th className="text-left py-2">Verified</th>
                            <th className="text-left py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-[var(--pw-border)]/50">
                                <td className="py-2">{u.display_name || u.full_name || "—"}</td>
                                <td className="py-2">{u.email}</td>
                                <td className="py-2">{u.role}</td>
                                <td className="py-2">{u.verification_status}</td>
                                <td className="py-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="admin-impersonate-btn"
                                        onClick={() => handleImpersonate(u.id, u.display_name || u.full_name || 'User')}
                                        disabled={impersonating === u.id}
                                    >
                                        {impersonating === u.id ? 'Impersonating...' : 'Impersonate'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}