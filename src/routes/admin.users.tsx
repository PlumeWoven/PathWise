import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/users")({
    component: AdminUsers,
});

function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
            setUsers(data || []);
        })();
    }, []);

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
                            <th className="text-left py-2">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-[var(--pw-border)]/50">
                                <td className="py-2">{u.display_name || u.full_name || "—"}</td>
                                <td className="py-2">{u.email}</td>
                                <td className="py-2">{u.role}</td>
                                <td className="py-2">{u.verification_status}</td>
                                <td className="py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}