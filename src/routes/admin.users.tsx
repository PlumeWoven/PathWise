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
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    })();
  }, []);

  const handleImpersonate = async (userId: string, userName: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const adminToken = session?.access_token;
      if (!adminToken) {
        toast.error("Not authenticated");
        return;
      }

      setImpersonating(userId);

      const response = await fetch("/api/impersonate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response as JSON. Raw text:", text);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || `Request failed (${response.status})`;
        throw new Error(errorMsg);
      }

      const { magicLink } = data;
      if (!magicLink) {
        throw new Error("No magic link returned from server");
      }

      // Store admin info for exit (including access token)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem("admin_user_id", user.id);
        localStorage.setItem("admin_email", user.email || "");
        localStorage.setItem("admin_access_token", adminToken);
      }

      localStorage.setItem("impersonating", "true");
      localStorage.setItem("impersonating_user_name", userName);

      // Sign out admin and wait for it to complete
      await supabase.auth.signOut();
      // Small delay to ensure session is cleared
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to magic link
      window.location.href = magicLink;
    } catch (err: unknown) {
      console.error("Impersonation error:", err);
      const e = err as { message?: string };
      toast.error(e?.message || "Impersonation failed");
      setImpersonating(null);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 className="font-display text-2xl uppercase tracking-[-0.025em] leading-none mb-8">
        Users
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="label-caps border-b border-[var(--pw-border)] text-[var(--pw-ink-2)]">
            <tr>
              <th className="text-left py-4 font-semibold">Name</th>
              <th className="text-left py-4 font-semibold">Email</th>
              <th className="text-left py-4 font-semibold">Role</th>
              <th className="text-left py-4 font-semibold">Verified</th>
              <th className="text-left py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--pw-border)]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-4">{u.display_name || u.full_name || "—"}</td>
                <td className="py-4">{u.email}</td>
                <td className="label-caps py-4 text-[var(--pw-ink-2)]">{u.role}</td>
                <td className="label-caps py-4 text-[var(--pw-ink-2)]">{u.verification_status}</td>
                <td className="py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="admin-impersonate-btn"
                    onClick={() => handleImpersonate(u.id, u.display_name || u.full_name || "User")}
                    disabled={impersonating === u.id}
                  >
                    {impersonating === u.id ? "Impersonating..." : "Impersonate"}
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
