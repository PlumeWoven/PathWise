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

  // Admin-only via RLS (is_admin); .select() so a blocked update isn't reported as success.
  const setVerification = async (userId: string, status: "verified" | "unverified") => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ verification_status: status })
      .eq("id", userId)
      .select("id");
    if (error || !data?.length) {
      toast.error(error?.message ?? "Not updated — are you signed in as an admin?");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verification_status: status } : u)));
    toast.success(status === "verified" ? "Tutor verified" : "Verification removed");
  };

  // Ban/unban runs server-side (service role) in api/admin-user.js.
  const setSuspended = async (userId: string, suspend: boolean) => {
    if (suspend && !window.confirm("Suspend this user? They won't be able to sign in.")) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/admin-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ userId, action: suspend ? "suspend" : "restore" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(body.error ?? `Failed (${res.status})`);
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              suspended_at: suspend ? new Date().toISOString() : null,
              verification_status: suspend ? "unverified" : u.verification_status,
            }
          : u,
      ),
    );
    toast.success(suspend ? "User suspended" : "User restored");
  };

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

      const { tokenHash } = data;
      if (!tokenHash) {
        throw new Error("No sign-in token returned from server");
      }

      // Store admin info for exit (including access token)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem("admin_user_id", user.id);
        localStorage.setItem("admin_email", user.email || "");
      }

      localStorage.setItem("impersonating", "true");
      localStorage.setItem("impersonating_user_name", userName);

      // Sign out admin and wait for it to complete
      await supabase.auth.signOut();
      // Sign in as the target. verifyOtp works with the PKCE client, unlike
      // following the magic link (its #access_token fragment is rejected).
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "magiclink",
      });
      if (otpError) throw otpError;

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Impersonation error:", err);
      // Don't leave the "You are impersonating" banner up when it failed.
      localStorage.removeItem("impersonating");
      localStorage.removeItem("impersonating_user_name");
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
              <th className="text-left py-4 font-semibold">Role</th>
              <th className="text-left py-4 font-semibold">Verified</th>
              <th className="text-left py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--pw-border)]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-4">{u.display_name || u.full_name || "—"}</td>
                <td className="label-caps py-4 text-[var(--pw-ink-2)]">{u.role}</td>
                <td className="label-caps py-4 text-[var(--pw-ink-2)]">
                  {u.suspended_at ? (
                    <span style={{ color: "var(--pw-danger)" }}>suspended</span>
                  ) : (
                    u.verification_status
                  )}
                </td>
                <td className="py-4 flex flex-wrap gap-2">
                  {(u.role === "tutor" || u.role === "both") &&
                    (u.verification_status === "verified" ? (
                      <Button variant="outline" size="sm" onClick={() => setVerification(u.id, "unverified")}>
                        Unverify
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setVerification(u.id, "verified")}>
                        Verify
                      </Button>
                    ))}
                  <Button variant="outline" size="sm" onClick={() => setSuspended(u.id, !u.suspended_at)}>
                    {u.suspended_at ? "Restore" : "Suspend"}
                  </Button>
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
