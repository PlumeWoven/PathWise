import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses")({
    component: AdminCourses,
});

function AdminCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("courses")
            .select("*, tutor:tutor_id(id, display_name, email)")
            .eq("status", "under_review")
            .order("created_at", { ascending: false });
        setCourses(data || []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleAction = async (id: string, newStatus: "published" | "draft") => {
        const { error } = await supabase.from("courses").update({ status: newStatus }).eq("id", id);
        if (error) {
            toast.error("Failed to update course");
        } else {
            toast.success(`Course ${newStatus === "published" ? "published" : "rejected"}`);
            await load();
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="font-display text-2xl mb-4">Courses Pending Review</h1>
            {courses.length === 0 ? (
                <p className="text-[var(--pw-ink-2)]">No courses waiting for review.</p>
            ) : (
                <div className="space-y-4">
                    {courses.map((c) => (
                        <div key={c.id} className="pw-card p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-medium">{c.title}</h3>
                                    <p className="text-sm text-[var(--pw-ink-2)]">by {c.tutor?.display_name || "Unknown"}</p>
                                    <p className="text-sm text-[var(--pw-ink-2)]">{c.category} · {c.difficulty}</p>
                                    {c.thumbnail_url && (
                                        <img src={c.thumbnail_url} alt="" className="w-32 h-20 object-cover rounded mt-2" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(c.id, "published")}
                                        className="pw-btn-primary text-sm px-4 py-2"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(c.id, "draft")}
                                        className="pw-btn-outline text-sm px-4 py-2"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}