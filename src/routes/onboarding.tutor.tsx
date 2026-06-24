import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { PWHeader } from "../pathwise/Header";
import { toast } from "sonner";
import Cropper, { Area } from "react-easy-crop";
import confetti from "canvas-confetti";
import {
  Camera, Check, ChevronLeft, ChevronRight, Search, Sparkles,
  Upload, Video as VideoIcon, X, Plus, Clock, DollarSign, Eye,
} from "lucide-react";
import { AvailabilityGrid, type CellState } from "@/pathwise/AvailabilityGrid";

export const Route = createFileRoute("/onboarding/tutor")({
  head: () => ({ meta: [{ title: "Tutor onboarding — PathWise" }] }),
  component: TutorWizard,
});

const STORAGE_KEY = "pw_tutor_onboarding_v1";
const STEPS = [
  "Basic Info",
  "Expertise",
  "Video Intro",
  "Availability",
  "Pricing",
  "Review",
];
const EDU_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Other"];

interface Subject { id: string; name: string; category: string | null }

interface PackageRow { sessions: number; discount_percent: number; enabled: boolean }

interface AvailSlot { day: number; hour: number }

interface WizardState {
  step: number;
  // step 1
  full_name: string;
  headline: string;
  bio: string;
  years_experience: string;
  education_level: string;
  institution: string;
  avatar_url: string | null;
  // step 2
  subject_ids: string[];
  proficiency: Record<string, number>; // subject_id -> 1..5
  specializations: string[];
  superpowers: string[];
  // step 3
  video_intro_url: string | null;
  video_thumbnail_url: string | null;
  // step 4
  availability: AvailSlot[];
  timezone: string;
  instant_bookings: boolean;
  buffer_minutes: number;
  // step 5
  hourly_rate: string;
  packages: PackageRow[];
  first_session_free: boolean;
  free_discovery_call: boolean;
}

const DEFAULT_STATE: WizardState = {
  step: 1,
  full_name: "",
  headline: "",
  bio: "",
  years_experience: "",
  education_level: "",
  institution: "",
  avatar_url: null,
  subject_ids: [],
  proficiency: {},
  specializations: [],
  superpowers: [],
  video_intro_url: null,
  video_thumbnail_url: null,
  availability: [],
  timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
  instant_bookings: false,
  buffer_minutes: 15,
  hourly_rate: "",
  packages: [
    { sessions: 5, discount_percent: 10, enabled: false },
    { sessions: 10, discount_percent: 20, enabled: false },
  ],
  first_session_free: false,
  free_discovery_call: false,
};

function loadLocal(): Partial<WizardState> {
  if (typeof localStorage === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveLocal(s: WizardState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { }
}

function TutorWizard() {
  const { loading, isLoggedIn, profile, refreshProfile, openLogin } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>(() => ({ ...DEFAULT_STATE, ...loadLocal() }));
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from DB once
  useEffect(() => {
    if (!profile) return;
    if (hydrated) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, headline, bio, years_experience, education_level, institution, avatar_url, subject_specialties, specializations, superpowers, subject_proficiency, video_intro_url, video_thumbnail_url, timezone, instant_bookings, buffer_minutes, hourly_rate, first_session_free, free_discovery_call, onboarding_step")
        .eq("id", profile.id)
        .maybeSingle();
      const [{ data: avail }, { data: pkgs }] = await Promise.all([
        supabase.from("tutor_availability").select("day_of_week, start_hour").eq("user_id", profile.id),
        supabase.from("tutor_packages").select("sessions, discount_percent, enabled").eq("user_id", profile.id),
      ]);
      setState((prev) => {
        const local = loadLocal();
        // Prefer local if step is in progress, else DB
        const merged: WizardState = {
          ...prev,
          full_name: prev.full_name || (data as any)?.full_name || "",
          headline: prev.headline || (data as any)?.headline || "",
          bio: prev.bio || (data as any)?.bio || "",
          years_experience: prev.years_experience || ((data as any)?.years_experience?.toString() ?? ""),
          education_level: prev.education_level || (data as any)?.education_level || "",
          institution: prev.institution || (data as any)?.institution || "",
          avatar_url: prev.avatar_url || (data as any)?.avatar_url || null,
          specializations: prev.specializations.length ? prev.specializations : ((data as any)?.specializations ?? []),
          superpowers: prev.superpowers.length ? prev.superpowers : ((data as any)?.superpowers ?? []),
          proficiency: Object.keys(prev.proficiency).length ? prev.proficiency : ((data as any)?.subject_proficiency ?? {}),
          video_intro_url: prev.video_intro_url || (data as any)?.video_intro_url || null,
          video_thumbnail_url: prev.video_thumbnail_url || (data as any)?.video_thumbnail_url || null,
          timezone: prev.timezone || (data as any)?.timezone || prev.timezone,
          instant_bookings: typeof local.instant_bookings === "boolean" ? prev.instant_bookings : !!(data as any)?.instant_bookings,
          buffer_minutes: prev.buffer_minutes ?? (data as any)?.buffer_minutes ?? 15,
          hourly_rate: prev.hourly_rate || ((data as any)?.hourly_rate?.toString() ?? ""),
          first_session_free: typeof local.first_session_free === "boolean" ? prev.first_session_free : !!(data as any)?.first_session_free,
          free_discovery_call: typeof local.free_discovery_call === "boolean" ? prev.free_discovery_call : !!(data as any)?.free_discovery_call,
          step: prev.step !== 1 ? prev.step : ((data as any)?.onboarding_step ?? 1),
        };
        if (avail?.length && !prev.availability.length) {
          merged.availability = avail.map((a: any) => ({ day: a.day_of_week, hour: a.start_hour }));
        }
        if (pkgs?.length) {
          merged.packages = pkgs.map((p: any) => ({ sessions: p.sessions, discount_percent: Number(p.discount_percent), enabled: p.enabled }));
        }
        return merged;
      });
      setHydrated(true);
    })();
  }, [profile, hydrated]);

  // Load subjects
  useEffect(() => {
    supabase.from("subjects").select("id, name, category").order("name").then(({ data }) => {
      if (data) setSubjects(data as any);
    });
  }, []);

  // Persist to localStorage on every change
  useEffect(() => { saveLocal(state); }, [state]);

  // Auth gate
  useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
  }, [loading, isLoggedIn, openLogin]);

  // If user already has subject_specialties from older flow, seed subject_ids
  useEffect(() => {
    if (!hydrated || !subjects.length || state.subject_ids.length) return;
    (async () => {
      if (!profile) return;
      const { data } = await supabase
        .from("profiles")
        .select("subject_specialties")
        .eq("id", profile.id)
        .maybeSingle();
      const names: string[] = ((data as any)?.subject_specialties ?? []) as string[];
      if (!names.length) return;
      const ids = subjects.filter((s) => names.includes(s.name)).map((s) => s.id);
      if (ids.length) setState((p) => ({ ...p, subject_ids: ids }));
    })();
  }, [hydrated, subjects, profile, state.subject_ids.length]);

  const update = useCallback(<K extends keyof WizardState>(k: K, v: WizardState[K]) => {
    setState((p) => ({ ...p, [k]: v }));
  }, []);

  // Save current step to DB
  const saveStep = useCallback(async (nextStep: number) => {
    if (!profile) return false;
    setSaving(true);
    try {
      const subjectNames = subjects.filter((s) => state.subject_ids.includes(s.id)).map((s) => s.name);
      const { error: pErr } = await supabase.from("profiles").update({
        full_name: state.full_name || null,
        headline: state.headline || null,
        bio: state.bio || null,
        years_experience: state.years_experience === "" ? null : Number(state.years_experience),
        education_level: state.education_level || null,
        institution: state.institution || null,
        avatar_url: state.avatar_url,
        subject_specialties: subjectNames,
        specializations: state.specializations,
        superpowers: state.superpowers,
        subject_proficiency: state.proficiency,
        video_intro_url: state.video_intro_url,
        video_thumbnail_url: state.video_thumbnail_url,
        timezone: state.timezone || null,
        instant_bookings: state.instant_bookings,
        buffer_minutes: state.buffer_minutes,
        hourly_rate: state.hourly_rate === "" ? null : Number(state.hourly_rate),
        first_session_free: state.first_session_free,
        free_discovery_call: state.free_discovery_call,
        onboarding_step: nextStep,
      }).eq("id", profile.id);
      if (pErr) throw pErr;

      // Replace availability
      await supabase.from("tutor_availability").delete().eq("user_id", profile.id);
      if (state.availability.length) {
        await supabase.from("tutor_availability").insert(
          state.availability.map((s) => ({
            user_id: profile.id,
            day_of_week: s.day,
            start_hour: s.hour,
            end_hour: s.hour + 1,
          })),
        );
      }
      // Replace packages
      await supabase.from("tutor_packages").delete().eq("user_id", profile.id);
      if (state.packages.length) {
        await supabase.from("tutor_packages").insert(
          state.packages.map((p) => ({
            user_id: profile.id,
            sessions: p.sessions,
            discount_percent: p.discount_percent,
            enabled: p.enabled,
          })),
        );
      }
      return true;
    } catch (e) {
      console.error("[onboarding] save error", e);
      toast.error("Couldn't save progress. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [profile, state, subjects]);

  const goNext = async () => {
    const nxt = Math.min(state.step + 1, STEPS.length);
    const ok = await saveStep(nxt);
    if (ok) setState((p) => ({ ...p, step: nxt }));
  };
  const goPrev = () => setState((p) => ({ ...p, step: Math.max(1, p.step - 1) }));
  const goSkip = async () => { await goNext(); };

  const publish = async () => {
    if (!profile) return;
    const ok = await saveStep(STEPS.length);
    if (!ok) return;
    const { error } = await supabase.from("profiles").update({
      onboarding_completed: true,
      verification_status: "pending",
    }).eq("id", profile.id);
    if (error) {
      toast.error("Couldn't publish profile.");
      return;
    }
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 250);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
    await refreshProfile();
    toast.success("Profile published! 🎉");
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-[760px] mx-auto px-5 sm:px-8 py-10">
        <ProgressBar step={state.step} />

        <div className="mt-8 pw-card p-6 sm:p-8">
          {state.step === 1 && <Step1 state={state} update={update} userId={profile.id} />}
          {state.step === 2 && <Step2 state={state} update={update} subjects={subjects} />}
          {state.step === 3 && <Step3 state={state} update={update} userId={profile.id} />}
          {state.step === 4 && <Step4 state={state} update={update} />}
          {state.step === 5 && <Step5 state={state} update={update} subjects={subjects} />}
          {state.step === 6 && <Step6 state={state} subjects={subjects} />}

          <div className="mt-8 flex items-center justify-between border-t pw-border pt-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={state.step === 1 || saving}
              className="inline-flex items-center gap-1 text-[14px] text-[var(--pw-ink-2)] disabled:opacity-40 hover:text-[var(--pw-ink)]"
            >
              <ChevronLeft className="size-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              {state.step < STEPS.length && (
                <button
                  type="button"
                  onClick={goSkip}
                  disabled={saving}
                  className="text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] px-3 py-2"
                >
                  Skip for now
                </button>
              )}
              {state.step < STEPS.length ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={saving}
                  className="pw-btn-primary inline-flex items-center gap-1 px-5 py-2.5 text-[14px] font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Continue"} <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={publish}
                  disabled={saving}
                  className="pw-btn-primary inline-flex items-center gap-1 px-6 py-2.5 text-[14px] font-medium disabled:opacity-50"
                >
                  <Sparkles className="size-4" /> Publish profile
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────── Progress bar ─────────────── */

function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
        Tutor onboarding · Step {step} of {STEPS.length}
      </div>
      <h1 className="font-display text-[30px] sm:text-[36px] leading-tight mt-2">
        {STEPS[step - 1]}
      </h1>
      <div className="mt-5 flex gap-2">
        {STEPS.map((label, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <div key={label} className="flex-1">
              <div
                className="h-1.5 rounded-full transition-colors"
                style={{
                  background: done || active ? "var(--pw-accent)" : "var(--pw-border)",
                }}
              />
              <div
                className="mt-1.5 text-[10.5px] font-mono-pw uppercase pw-tracking-wide hidden sm:block"
                style={{ color: active ? "var(--pw-ink)" : "var(--pw-ink-2)" }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── Step 1: Basic Info ─────────────── */

function Step1({
  state, update, userId,
}: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; userId: string }) {
  const [cropFile, setCropFile] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCropFile(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function getCroppedBlob(): Promise<Blob | null> {
    if (!cropFile || !pixels) return null;
    const img = new Image();
    img.src = cropFile;
    await new Promise((r) => { img.onload = r; });
    const size = Math.max(400, Math.min(pixels.width, pixels.height));
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, size, size);
    return new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.9));
  }

  async function confirmCrop() {
    if (!pixels) return;
    if (pixels.width < 400 || pixels.height < 400) {
      toast.error("Crop area must be at least 400×400px. Pick a larger photo or zoom out.");
      return;
    }
    setUploading(true);
    try {
      const blob = await getCroppedBlob();
      if (!blob) throw new Error("No blob");
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("profile-photos").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      update("avatar_url", data.publicUrl);
      setCropFile(null);
      toast.success("Photo uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const headlineLeft = 140 - state.headline.length;

  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[var(--pw-ink-2)]">Tell students who you are.</p>

      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <div className="size-24 rounded-full overflow-hidden bg-[var(--pw-surface-2)] flex items-center justify-center pw-border border">
            {state.avatar_url ? (
              <img src={state.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              <Camera className="size-7 text-[var(--pw-ink-2)]" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <Label>Profile photo</Label>
          <p className="text-[12.5px] text-[var(--pw-ink-2)] mt-0.5">Square 1:1, min 400×400px.</p>
          <label className="mt-2 inline-flex items-center gap-1.5 pw-pill pw-border border px-3 py-1.5 text-[13px] cursor-pointer bg-[var(--pw-surface)] hover:bg-[var(--pw-surface-2)]">
            <Upload className="size-3.5" /> Choose photo
            <input type="file" accept="image/*" className="hidden" onChange={onPick} />
          </label>
        </div>
      </div>

      {cropFile && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !uploading && setCropFile(null)}>
          <div className="bg-[var(--pw-surface)] rounded-xl p-4 max-w-[480px] w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[20px]">Crop your photo</h3>
            <div className="relative mt-3 h-[320px] bg-black rounded-md overflow-hidden">
              <Cropper
                image={cropFile}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_a, p) => setPixels(p)}
              />
            </div>
            <input
              type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full mt-3"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setCropFile(null)} disabled={uploading} className="px-3 py-2 text-[13px]">Cancel</button>
              <button onClick={confirmCrop} disabled={uploading} className="pw-btn-primary px-4 py-2 text-[13px] disabled:opacity-50">
                {uploading ? "Uploading…" : "Save photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>Full name</Label>
        <Input value={state.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Jane Doe" />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <Label>Headline</Label>
          <span className="font-mono-pw text-[11px]" style={{ color: headlineLeft < 0 ? "var(--pw-danger)" : "var(--pw-ink-2)" }}>
            {headlineLeft} chars left
          </span>
        </div>
        <Input
          value={state.headline}
          maxLength={140}
          onChange={(e) => update("headline", e.target.value)}
          placeholder="MIT-trained math tutor specializing in SAT prep"
        />
      </div>

      <div>
        <Label>Bio (markdown supported)</Label>
        <textarea
          rows={5}
          value={state.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="**About me…** Share your teaching style, experience, what you love."
          className="mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)] font-mono-pw"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label>Years of experience</Label>
          <Input
            type="number" min={0} max={70}
            value={state.years_experience}
            onChange={(e) => update("years_experience", e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <Label>Education level</Label>
          <select
            value={state.education_level}
            onChange={(e) => update("education_level", e.target.value)}
            className="mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
          >
            <option value="">Select…</option>
            {EDU_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label>Institution</Label>
        <Input value={state.institution} onChange={(e) => update("institution", e.target.value)} placeholder="Stanford University" />
      </div>
    </div>
  );
}

/* ─────────────── Step 2: Expertise & Subjects ─────────────── */

function Step2({
  state, update, subjects,
}: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; subjects: Subject[] }) {
  const [q, setQ] = useState("");
  const [specInput, setSpecInput] = useState("");
  const [superInput, setSuperInput] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return subjects.filter((s) => !t || s.name.toLowerCase().includes(t));
  }, [subjects, q]);

  function toggleSubject(id: string) {
    const has = state.subject_ids.includes(id);
    const next = has ? state.subject_ids.filter((x) => x !== id) : [...state.subject_ids, id];
    update("subject_ids", next);
    if (!has && !state.proficiency[id]) {
      update("proficiency", { ...state.proficiency, [id]: 3 });
    }
  }

  function setProf(id: string, v: number) {
    update("proficiency", { ...state.proficiency, [id]: v });
  }

  function addTag(kind: "specializations" | "superpowers", val: string, setter: (v: string) => void) {
    const t = val.trim();
    if (!t) return;
    if (state[kind].includes(t)) { setter(""); return; }
    update(kind, [...state[kind], t]);
    setter("");
  }

  return (
    <div className="space-y-6">
      <p className="text-[14px] text-[var(--pw-ink-2)]">What do you teach, and what makes you stand out?</p>

      <div>
        <Label>Subjects</Label>
        <div className="mt-1 relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pw-ink-2)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects…"
            className="w-full pw-border border rounded-md pl-9 pr-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 max-h-[180px] overflow-y-auto">
          {filtered.map((s) => {
            const on = state.subject_ids.includes(s.id);
            return (
              <button
                type="button" key={s.id}
                onClick={() => toggleSubject(s.id)}
                className="pw-pill border px-3 py-1.5 text-[13px] transition-colors"
                style={{
                  borderColor: on ? "var(--pw-accent)" : "var(--pw-border)",
                  background: on ? "var(--pw-accent-soft)" : "var(--pw-surface)",
                  color: on ? "var(--pw-accent)" : "var(--pw-ink)",
                }}
              >
                {on && <Check className="inline size-3 mr-1" />}{s.name}
              </button>
            );
          })}
        </div>
      </div>

      {state.subject_ids.length > 0 && (
        <div>
          <Label>Proficiency per subject</Label>
          <div className="mt-2 space-y-3">
            {state.subject_ids.map((id) => {
              const subj = subjects.find((s) => s.id === id);
              if (!subj) return null;
              const v = state.proficiency[id] ?? 3;
              const labels = ["Beginner", "Novice", "Intermediate", "Advanced", "Expert"];
              return (
                <div key={id} className="pw-border border rounded-md p-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium">{subj.name}</span>
                    <span className="font-mono-pw text-[11px] text-[var(--pw-ink-2)]">{labels[v - 1]}</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={1} value={v}
                    onChange={(e) => setProf(id, Number(e.target.value))}
                    className="w-full mt-2 accent-[var(--pw-accent)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TagField
        label="Specializations"
        helper="e.g., AP Calculus, SAT Prep, Dyslexia Specialist"
        tags={state.specializations}
        input={specInput}
        setInput={setSpecInput}
        onAdd={() => addTag("specializations", specInput, setSpecInput)}
        onRemove={(t) => update("specializations", state.specializations.filter((x) => x !== t))}
      />
      <TagField
        label="Superpowers ✨"
        helper="Highlighted on your profile — what you're truly best at"
        tags={state.superpowers}
        input={superInput}
        setInput={setSuperInput}
        onAdd={() => addTag("superpowers", superInput, setSuperInput)}
        onRemove={(t) => update("superpowers", state.superpowers.filter((x) => x !== t))}
        accent
      />
    </div>
  );
}

function TagField({
  label, helper, tags, input, setInput, onAdd, onRemove, accent,
}: {
  label: string; helper?: string; tags: string[]; input: string;
  setInput: (v: string) => void; onAdd: () => void; onRemove: (t: string) => void; accent?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {helper && <p className="text-[12px] text-[var(--pw-ink-2)] mt-0.5">{helper}</p>}
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder="Type and press Enter"
          className="flex-1 pw-border border rounded-md px-3 py-2 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
        />
        <button type="button" onClick={onAdd} className="pw-pill border pw-border px-3 text-[13px] bg-[var(--pw-surface)] hover:bg-[var(--pw-surface-2)]">
          <Plus className="size-3.5" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="pw-pill border px-3 py-1 text-[12.5px] inline-flex items-center gap-1.5"
              style={{
                borderColor: accent ? "var(--pw-accent-3)" : "var(--pw-border)",
                background: accent ? "rgba(244,196,48,0.15)" : "var(--pw-surface)",
                color: accent ? "#8a6d00" : "var(--pw-ink)",
              }}
            >
              {accent && <Sparkles className="size-3" />}{t}
              <button type="button" onClick={() => onRemove(t)} className="opacity-60 hover:opacity-100">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Step 3: Video Intro ─────────────── */

function Step3({
  state, update, userId,
}: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; userId: string }) {
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(state.video_intro_url);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
  }, []);

  async function startRecord() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        await uploadVideo(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setRecording(true);
      stopTimerRef.current = window.setTimeout(stopRecord, 120_000);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't access camera/microphone.");
    }
  }
  function stopRecord() {
    if (stopTimerRef.current) { window.clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 60 * 1024 * 1024) {
      toast.error("Video too large (max ~60MB).");
      return;
    }
    await uploadVideo(f);
  }

  async function uploadVideo(blob: Blob) {
    setUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const path = `${userId}/intro-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("tutor-videos").upload(path, blob, { upsert: true, contentType: blob.type });
      if (error) throw error;
      const { data } = supabase.storage.from("tutor-videos").getPublicUrl(path);
      update("video_intro_url", data.publicUrl);
      setPreviewUrl(data.publicUrl);
      // generate thumbnail at 5s
      const thumbUrl = await generateThumbnail(data.publicUrl, userId);
      if (thumbUrl) update("video_thumbnail_url", thumbUrl);
      toast.success("Video uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function generateThumbnail(url: string, uid: string): Promise<string | null> {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.src = url;
      v.muted = true;
      v.playsInline = true;
      v.onloadedmetadata = () => { v.currentTime = Math.min(5, (v.duration || 5) - 0.1); };
      v.onseeked = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth || 640;
        canvas.height = v.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (b) => {
          if (!b) return resolve(null);
          const path = `${uid}/thumb-${Date.now()}.jpg`;
          const { error } = await supabase.storage.from("tutor-videos").upload(path, b, { upsert: true, contentType: "image/jpeg" });
          if (error) { console.warn("thumb upload", error); return resolve(null); }
          const { data } = supabase.storage.from("tutor-videos").getPublicUrl(path);
          resolve(data.publicUrl);
        }, "image/jpeg", 0.85);
      };
      v.onerror = () => resolve(null);
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[var(--pw-ink-2)]">A 60-90s intro video doubles your booking rate.</p>

      <div className="rounded-md p-4" style={{ background: "var(--pw-accent-soft)", border: "1px solid var(--pw-accent)" }}>
        <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide" style={{ color: "var(--pw-accent)" }}>Tips</div>
        <p className="text-[13px] mt-1">Introduce yourself, share your teaching philosophy, and what makes you unique.</p>
      </div>

      {previewUrl ? (
        <div>
          <video src={previewUrl} controls poster={state.video_thumbnail_url ?? undefined} className="w-full rounded-md bg-black aspect-video" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setPreviewUrl(null); update("video_intro_url", null); update("video_thumbnail_url", null); }}
              className="pw-pill border pw-border px-3 py-1.5 text-[13px] bg-[var(--pw-surface)]">Re-record / Replace</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <video ref={videoRef} className="w-full rounded-md bg-black aspect-video" />
          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <button onClick={startRecord} disabled={uploading}
                className="pw-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[13px] disabled:opacity-50">
                <VideoIcon className="size-4" /> Record now
              </button>
            ) : (
              <button onClick={stopRecord} className="pw-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[13px]"
                style={{ background: "var(--pw-danger)" }}>
                Stop recording
              </button>
            )}
            <label className="pw-pill border pw-border px-3 py-2 text-[13px] cursor-pointer bg-[var(--pw-surface)] inline-flex items-center gap-1.5 hover:bg-[var(--pw-surface-2)]">
              <Upload className="size-3.5" /> Upload file
              <input type="file" accept="video/*" className="hidden" onChange={onUploadFile} />
            </label>
            {uploading && <span className="text-[12px] text-[var(--pw-ink-2)] self-center">Uploading…</span>}
          </div>
          <p className="text-[11.5px] text-[var(--pw-ink-2)]">Max 2 minutes. Thumbnail auto-generated at 5s.</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Step 4: Availability (drag-to-paint) ─────────────── */

function Step4({
  state, update,
}: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  // Build grid from availability array
  const buildGrid = (availability: AvailSlot[]): Record<string, CellState> => {
    const grid: Record<string, CellState> = {};
    availability.forEach((slot) => {
      const key = `${slot.day}-${slot.hour}`;
      grid[key] = "available";
    });
    return grid;
  };

  const [grid, setGrid] = useState<Record<string, CellState>>(() => buildGrid(state.availability));

  // Sync when state.availability changes (e.g., hydration)
  useEffect(() => {
    setGrid(buildGrid(state.availability));
  }, [state.availability]);

  const handleGridChange = (newGrid: Record<string, CellState>) => {
    setGrid(newGrid);
    // Convert to availability array (only available slots)
    const slots: AvailSlot[] = [];
    Object.entries(newGrid).forEach(([key, value]) => {
      if (value === "available") {
        const [day, hour] = key.split("-").map(Number);
        slots.push({ day, hour });
      }
    });
    update("availability", slots);
  };

  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[var(--pw-ink-2)]">When are you available each week? Drag to paint multiple cells.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Timezone</Label>
          <Input value={state.timezone} onChange={(e) => update("timezone", e.target.value)} />
          <p className="text-[11.5px] text-[var(--pw-ink-2)] mt-1">Auto-detected — you can change it.</p>
        </div>
        <div>
          <Label>Buffer time between sessions</Label>
          <select
            value={state.buffer_minutes}
            onChange={(e) => update("buffer_minutes", Number(e.target.value))}
            className="mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
          >
            {[0, 15, 30, 60].map((v) => <option key={v} value={v}>{v} min</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Booking mode</Label>
        <div className="mt-2 flex gap-2">
          {[
            { v: false, label: "Manual approval" },
            { v: true, label: "Instant bookings" },
          ].map((o) => {
            const on = state.instant_bookings === o.v;
            return (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => update("instant_bookings", o.v)}
                className="pw-pill border px-4 py-2 text-[13px]"
                style={{
                  borderColor: on ? "var(--pw-accent)" : "var(--pw-border)",
                  background: on ? "var(--pw-accent-soft)" : "var(--pw-surface)",
                  color: on ? "var(--pw-accent)" : "var(--pw-ink)",
                }}
              >{o.label}</button>
            );
          })}
        </div>
      </div>

      <AvailabilityGrid
        grid={grid}
        onChange={handleGridChange}
        bookedSlots={new Set()}
        className="mt-2"
      />
    </div>
  );
}

/* ─────────────── Step 5: Pricing ─────────────── */

function Step5({
  state, update, subjects,
}: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; subjects: Subject[] }) {
  const rate = Number(state.hourly_rate) || 0;
  const selectedSubjects = subjects.filter((s) => state.subject_ids.includes(s.id));
  const marketRates: Record<string, [number, number]> = {
    "STEM": [40, 90], "Test Prep": [60, 120], "Languages": [30, 70],
    "Humanities": [35, 75],
  };
  const suggestion = selectedSubjects[0]?.category
    ? marketRates[selectedSubjects[0].category!] : [40, 80];

  function updPkg(i: number, patch: Partial<PackageRow>) {
    const next = state.packages.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    update("packages", next);
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Default hourly rate (USD)</Label>
        <div className="mt-1 relative">
          <DollarSign className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pw-ink-2)]" />
          <input
            type="number" min={0} value={state.hourly_rate}
            onChange={(e) => update("hourly_rate", e.target.value)}
            className="w-full pw-border border rounded-md pl-9 pr-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)]"
            placeholder="50"
          />
        </div>
        <p className="text-[12px] text-[var(--pw-ink-2)] mt-1">
          Suggested for your subjects: ${suggestion?.[0]}–${suggestion?.[1]}/hr
        </p>
      </div>

      <div>
        <Label>Package deals</Label>
        <p className="text-[12px] text-[var(--pw-ink-2)]">Encourage longer commitments with bundle discounts.</p>
        <div className="mt-2 space-y-2">
          {state.packages.map((p, i) => (
            <div key={i} className="pw-border border rounded-md p-3 flex items-center gap-3">
              <input
                type="checkbox" checked={p.enabled}
                onChange={(e) => updPkg(i, { enabled: e.target.checked })}
                className="accent-[var(--pw-accent)]"
              />
              <span className="text-[13px] flex-1">
                {p.sessions}-session pack · {p.discount_percent}% off
                {rate > 0 && (
                  <span className="text-[var(--pw-ink-2)]"> → ${(rate * p.sessions * (1 - p.discount_percent / 100)).toFixed(0)} total</span>
                )}
              </span>
              <input
                type="number" min={0} max={50} value={p.discount_percent}
                onChange={(e) => updPkg(i, { discount_percent: Number(e.target.value) })}
                className="w-16 pw-border border rounded px-2 py-1 text-[13px]"
              />
              <span className="text-[12px] text-[var(--pw-ink-2)]">%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <ToggleRow
          checked={state.first_session_free}
          onChange={(v) => update("first_session_free", v)}
          label="First session free"
          helper="A risk-free way for students to try you out"
        />
        <ToggleRow
          checked={state.free_discovery_call}
          onChange={(v) => update("free_discovery_call", v)}
          label="Free 15-min discovery call"
          helper="Quick chat before booking a full session"
        />
      </div>

      <div className="pw-border border rounded-md p-4 bg-[var(--pw-surface-2)]">
        <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">Search preview</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-[24px]">${rate || "—"}</span>
          <span className="text-[12px] text-[var(--pw-ink-2)]">/ hour</span>
          {state.first_session_free && (
            <span className="ml-auto pw-pill border pw-border px-2 py-0.5 text-[11px] bg-[var(--pw-surface)]">First free</span>
          )}
        </div>
        {state.packages.some((p) => p.enabled) && (
          <div className="mt-1 text-[12px] text-[var(--pw-accent)]">Save up to {Math.max(...state.packages.filter((p) => p.enabled).map((p) => p.discount_percent))}% with packages</div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ checked, onChange, label, helper }: { checked: boolean; onChange: (v: boolean) => void; label: string; helper: string }) {
  return (
    <label className="pw-border border rounded-md p-3 flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--pw-accent)]" />
      <span className="flex-1">
        <span className="text-[13.5px] font-medium block">{label}</span>
        <span className="text-[12px] text-[var(--pw-ink-2)]">{helper}</span>
      </span>
    </label>
  );
}

/* ─────────────── Step 6: Review & Publish ─────────────── */

function Step6({ state, subjects }: { state: WizardState; subjects: Subject[] }) {
  const missing: string[] = [];
  if (!state.full_name) missing.push("Full name");
  if (!state.headline) missing.push("Headline");
  if (!state.bio) missing.push("Bio");
  if (!state.avatar_url) missing.push("Profile photo");
  if (!state.subject_ids.length) missing.push("At least one subject");
  if (!state.video_intro_url) missing.push("Video intro");
  if (!state.availability.length) missing.push("Availability");
  if (!state.hourly_rate) missing.push("Hourly rate");

  const subjectNames = subjects.filter((s) => state.subject_ids.includes(s.id)).map((s) => s.name);

  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[var(--pw-ink-2)]">Here's how students will see your profile.</p>

      <div className="pw-border border rounded-lg overflow-hidden">
        {state.video_thumbnail_url || state.video_intro_url ? (
          <div className="relative aspect-video bg-black">
            <img src={state.video_thumbnail_url || ""} alt="" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-12 rounded-full bg-white/90 flex items-center justify-center">
                <VideoIcon className="size-5" />
              </div>
            </div>
          </div>
        ) : null}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full overflow-hidden bg-[var(--pw-surface-2)] shrink-0">
              {state.avatar_url && <img src={state.avatar_url} alt="" className="size-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[22px] leading-tight">{state.full_name || "Your name"}</div>
              <div className="text-[13px] text-[var(--pw-ink-2)] mt-0.5 line-clamp-2">{state.headline || "Your headline"}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {subjectNames.slice(0, 4).map((n) => (
                  <span key={n} className="pw-pill border pw-border px-2 py-0.5 text-[11px] bg-[var(--pw-surface-2)]">{n}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-[22px]">${state.hourly_rate || "—"}</div>
              <div className="text-[11px] text-[var(--pw-ink-2)]">/hr</div>
            </div>
          </div>
          {state.superpowers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {state.superpowers.map((t) => (
                <span key={t} className="pw-pill border px-2 py-0.5 text-[11px] inline-flex items-center gap-1"
                  style={{ borderColor: "var(--pw-accent-3)", background: "rgba(244,196,48,0.18)", color: "#8a6d00" }}>
                  <Sparkles className="size-3" />{t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 text-[13px] text-[var(--pw-ink)] whitespace-pre-wrap line-clamp-4">{state.bio}</div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-[var(--pw-ink-2)] font-mono-pw uppercase pw-tracking-wide">
            {state.years_experience && <span>{state.years_experience} yrs exp</span>}
            {state.education_level && <span>· {state.education_level}{state.institution ? `, ${state.institution}` : ""}</span>}
            {state.availability.length > 0 && <span><Clock className="inline size-3 mr-1" />{state.availability.length} slots/wk</span>}
            {state.first_session_free && <span style={{ color: "var(--pw-accent)" }}>· First session free</span>}
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="pw-border border rounded-md p-4" style={{ background: "rgba(224,90,90,0.06)", borderColor: "var(--pw-danger)" }}>
          <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide" style={{ color: "var(--pw-danger)" }}>
            Still missing ({missing.length})
          </div>
          <ul className="mt-1 text-[13px] list-disc list-inside text-[var(--pw-ink)]">
            {missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <p className="text-[12px] text-[var(--pw-ink-2)] mt-1">You can still publish, but a complete profile gets 3× more bookings.</p>
        </div>
      )}

      <div className="text-[12px] text-[var(--pw-ink-2)] inline-flex items-center gap-1">
        <Eye className="size-3.5" /> Your profile will enter verification review after publishing.
      </div>
    </div>
  );
}

/* ─────────────── tiny field primitives ─────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] block">{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-[var(--pw-surface)] outline-none focus:border-[var(--pw-accent)] " + (props.className ?? "")} />;
}