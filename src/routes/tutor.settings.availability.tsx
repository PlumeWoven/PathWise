import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function TutorAvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([
    { label: "Monday", value: 1, slots: [] as { start: number; end: number }[] },
    { label: "Tuesday", value: 2, slots: [] },
    { label: "Wednesday", value: 3, slots: [] },
    { label: "Thursday", value: 4, slots: [] },
    { label: "Friday", value: 5, slots: [] },
    { label: "Saturday", value: 6, slots: [] },
    { label: "Sunday", value: 0, slots: [] },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_blocked", false)
        .order("day_of_week")
        .order("start_hour");
      if (error) {
        toast.error("Failed to load availability");
      } else if (data) {
        // Transform DB rows into slots per day
        const newDays = days.map((day) => ({
          ...day,
          slots: (data as any[])
            .filter((row) => row.day_of_week === day.value)
            .map((row) => ({ start: row.start_hour, end: row.end_hour })),
        }));
        setDays(newDays);
      }
      setLoading(false);
    })();
  }, [user]);

  const addSlot = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].slots.push({ start: 9, end: 10 });
    setDays(newDays);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].slots.splice(slotIndex, 1);
    setDays(newDays);
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: "start" | "end", value: number) => {
    const newDays = [...days];
    newDays[dayIndex].slots[slotIndex][field] = value;
    setDays(newDays);
  };

  const saveAvailability = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      // Delete existing non‑blocked slots
      await supabase.from("tutor_availability").delete().eq("user_id", user.id).eq("is_blocked", false);
      // Insert new slots
      const inserts: any[] = [];
      days.forEach((day) => {
        day.slots.forEach((slot) => {
          inserts.push({
            user_id: user.id,
            day_of_week: day.value,
            start_hour: slot.start,
            end_hour: slot.end,
            is_blocked: false,
          });
        });
      });
      if (inserts.length) {
        const { error } = await supabase.from("tutor_availability").insert(inserts);
        if (error) throw error;
      }
      toast.success("Availability saved");
    } catch (err) {
      toast.error("Failed to save availability");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading availability...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl">Availability</h1>
        <button onClick={saveAvailability} disabled={saving} className="pw-btn-primary">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
      <div className="space-y-4">
        {days.map((day, di) => (
          <div key={day.value} className="pw-card p-4">
            <div className="font-medium mb-2">{day.label}</div>
            {day.slots.length === 0 ? (
              <div className="text-sm text-[var(--pw-ink-2)]">No hours set</div>
            ) : (
              <div className="space-y-2">
                {day.slots.map((slot, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <select
                      value={slot.start}
                      onChange={(e) => updateSlot(di, si, "start", parseInt(e.target.value))}
                      className="pw-border rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                      ))}
                    </select>
                    <span>–</span>
                    <select
                      value={slot.end}
                      onChange={(e) => updateSlot(di, si, "end", parseInt(e.target.value))}
                      className="pw-border rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                      ))}
                    </select>
                    <button onClick={() => removeSlot(di, si)} className="text-red-500 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => addSlot(di)} className="mt-2 text-sm text-[var(--pw-accent)]">+ Add time slot</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tutor/settings/availability")({
  component: TutorAvailabilityPage,
});

// Named export for reuse in dashboard
const TutorAvailabilityComponent = Route.options.component;
export { TutorAvailabilityComponent as TutorAvailabilityPage };