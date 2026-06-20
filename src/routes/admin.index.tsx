import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
    component: AdminDashboard,
});

function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, tutors: 0, students: 0, courses: 0, pending: 0 });

    useEffect(() => {
        (async () => {
            const [users, tutors, students, courses, pending] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor"),
                supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
                supabase.from("courses").select("*", { count: "exact", head: true }),
                supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "under_review"),
            ]);
            setStats({
                users: users.count || 0,
                tutors: tutors.count || 0,
                students: students.count || 0,
                courses: courses.count || 0,
                pending: pending.count || 0,
            });
        })();
    }, []);

    return (
        <div>
            <h1 className="font-display text-3xl mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.users} />
                <StatCard label="Tutors" value={stats.tutors} />
                <StatCard label="Students" value={stats.students} />
                <StatCard label="Courses" value={stats.courses} />
                <StatCard label="Pending Review" value={stats.pending} />
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="pw-card p-4">
            <div className="text-sm text-[var(--pw-ink-2)]">{label}</div>
            <div className="font-display text-2xl">{value}</div>
        </div>
    );
}