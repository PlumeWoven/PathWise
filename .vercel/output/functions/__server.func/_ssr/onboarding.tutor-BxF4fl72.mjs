import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, s as supabase, P as PWHeader } from "./router-C4GolrgT.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as Cropper } from "../_libs/react-easy-crop.mjs";
import { c as confetti } from "../_libs/canvas-confetti.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { o as ChevronLeft, d as ChevronRight, q as Sparkles, r as Camera, U as Upload, s as Search, e as Check, V as Video, D as DollarSign, C as Clock, E as Eye, P as Plus, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__zod-adapter.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
import "../_libs/normalize-wheel.mjs";
const STORAGE_KEY = "pw_tutor_onboarding_v1";
const STEPS = ["Basic Info", "Expertise", "Video Intro", "Availability", "Pricing", "Review"];
const EDU_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Other"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({
  length: 24
}, (_, i) => i);
const DEFAULT_STATE = {
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
  packages: [{
    sessions: 5,
    discount_percent: 10,
    enabled: false
  }, {
    sessions: 10,
    discount_percent: 20,
    enabled: false
  }],
  first_session_free: false,
  free_discovery_call: false
};
function loadLocal() {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveLocal(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
  }
}
function TutorWizard() {
  const {
    loading,
    isLoggedIn,
    profile,
    refreshProfile,
    openLogin
  } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = reactExports.useState(() => ({
    ...DEFAULT_STATE,
    ...loadLocal()
  }));
  const [subjects, setSubjects] = reactExports.useState([]);
  const [saving, setSaving] = reactExports.useState(false);
  const [hydrated, setHydrated] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!profile) return;
    if (hydrated) return;
    (async () => {
      const {
        data
      } = await supabase.from("profiles").select("full_name, headline, bio, years_experience, education_level, institution, avatar_url, subject_specialties, specializations, superpowers, subject_proficiency, video_intro_url, video_thumbnail_url, timezone, instant_bookings, buffer_minutes, hourly_rate, first_session_free, free_discovery_call, onboarding_step").eq("id", profile.id).maybeSingle();
      const [{
        data: avail
      }, {
        data: pkgs
      }] = await Promise.all([supabase.from("tutor_availability").select("day_of_week, start_hour").eq("user_id", profile.id), supabase.from("tutor_packages").select("sessions, discount_percent, enabled").eq("user_id", profile.id)]);
      setState((prev) => {
        const local = loadLocal();
        const merged = {
          ...prev,
          full_name: prev.full_name || data?.full_name || "",
          headline: prev.headline || data?.headline || "",
          bio: prev.bio || data?.bio || "",
          years_experience: prev.years_experience || (data?.years_experience?.toString() ?? ""),
          education_level: prev.education_level || data?.education_level || "",
          institution: prev.institution || data?.institution || "",
          avatar_url: prev.avatar_url || data?.avatar_url || null,
          specializations: prev.specializations.length ? prev.specializations : data?.specializations ?? [],
          superpowers: prev.superpowers.length ? prev.superpowers : data?.superpowers ?? [],
          proficiency: Object.keys(prev.proficiency).length ? prev.proficiency : data?.subject_proficiency ?? {},
          video_intro_url: prev.video_intro_url || data?.video_intro_url || null,
          video_thumbnail_url: prev.video_thumbnail_url || data?.video_thumbnail_url || null,
          timezone: prev.timezone || data?.timezone || prev.timezone,
          instant_bookings: typeof local.instant_bookings === "boolean" ? prev.instant_bookings : !!data?.instant_bookings,
          buffer_minutes: prev.buffer_minutes ?? data?.buffer_minutes ?? 15,
          hourly_rate: prev.hourly_rate || (data?.hourly_rate?.toString() ?? ""),
          first_session_free: typeof local.first_session_free === "boolean" ? prev.first_session_free : !!data?.first_session_free,
          free_discovery_call: typeof local.free_discovery_call === "boolean" ? prev.free_discovery_call : !!data?.free_discovery_call,
          step: prev.step !== 1 ? prev.step : data?.onboarding_step ?? 1
        };
        if (avail?.length && !prev.availability.length) {
          merged.availability = avail.map((a) => ({
            day: a.day_of_week,
            hour: a.start_hour
          }));
        }
        if (pkgs?.length) {
          merged.packages = pkgs.map((p) => ({
            sessions: p.sessions,
            discount_percent: Number(p.discount_percent),
            enabled: p.enabled
          }));
        }
        return merged;
      });
      setHydrated(true);
    })();
  }, [profile, hydrated]);
  reactExports.useEffect(() => {
    supabase.from("subjects").select("id, name, category").order("name").then(({
      data
    }) => {
      if (data) setSubjects(data);
    });
  }, []);
  reactExports.useEffect(() => {
    saveLocal(state);
  }, [state]);
  reactExports.useEffect(() => {
    if (!loading && !isLoggedIn) openLogin();
  }, [loading, isLoggedIn, openLogin]);
  reactExports.useEffect(() => {
    if (!hydrated || !subjects.length || state.subject_ids.length) return;
    (async () => {
      if (!profile) return;
      const {
        data
      } = await supabase.from("profiles").select("subject_specialties").eq("id", profile.id).maybeSingle();
      const names = data?.subject_specialties ?? [];
      if (!names.length) return;
      const ids = subjects.filter((s) => names.includes(s.name)).map((s) => s.id);
      if (ids.length) setState((p) => ({
        ...p,
        subject_ids: ids
      }));
    })();
  }, [hydrated, subjects, profile, state.subject_ids.length]);
  const update = reactExports.useCallback((k, v) => {
    setState((p) => ({
      ...p,
      [k]: v
    }));
  }, []);
  const saveStep = reactExports.useCallback(async (nextStep) => {
    if (!profile) return false;
    setSaving(true);
    try {
      const subjectNames = subjects.filter((s) => state.subject_ids.includes(s.id)).map((s) => s.name);
      const {
        error: pErr
      } = await supabase.from("profiles").update({
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
        onboarding_step: nextStep
      }).eq("id", profile.id);
      if (pErr) throw pErr;
      await supabase.from("tutor_availability").delete().eq("user_id", profile.id);
      if (state.availability.length) {
        await supabase.from("tutor_availability").insert(state.availability.map((s) => ({
          user_id: profile.id,
          day_of_week: s.day,
          start_hour: s.hour,
          end_hour: s.hour + 1
        })));
      }
      await supabase.from("tutor_packages").delete().eq("user_id", profile.id);
      if (state.packages.length) {
        await supabase.from("tutor_packages").insert(state.packages.map((p) => ({
          user_id: profile.id,
          sessions: p.sessions,
          discount_percent: p.discount_percent,
          enabled: p.enabled
        })));
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
    if (ok) setState((p) => ({
      ...p,
      step: nxt
    }));
  };
  const goPrev = () => setState((p) => ({
    ...p,
    step: Math.max(1, p.step - 1)
  }));
  const goSkip = async () => {
    await goNext();
  };
  const publish = async () => {
    if (!profile) return;
    const ok = await saveStep(STEPS.length);
    if (!ok) return;
    const {
      error
    } = await supabase.from("profiles").update({
      onboarding_completed: true,
      verification_status: "pending"
    }).eq("id", profile.id);
    if (error) {
      toast.error("Couldn't publish profile.");
      return;
    }
    confetti({
      particleCount: 140,
      spread: 80,
      origin: {
        y: 0.65
      }
    });
    setTimeout(() => confetti({
      particleCount: 80,
      spread: 100,
      origin: {
        y: 0.6
      }
    }), 250);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
    await refreshProfile();
    toast.success("Profile published! 🎉");
    setTimeout(() => navigate({
      to: "/dashboard"
    }), 1200);
  };
  if (loading || !profile) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-[760px] mx-auto px-5 sm:px-8 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressBar, { step: state.step }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 pw-card p-6 sm:p-8", children: [
        state.step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step1, { state, update, userId: profile.id }),
        state.step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step2, { state, update, subjects }),
        state.step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step3, { state, update, userId: profile.id }),
        state.step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step4, { state, update }),
        state.step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step5, { state, update, subjects }),
        state.step === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step6, { state, subjects }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between border-t pw-border pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: goPrev, disabled: state.step === 1 || saving, className: "inline-flex items-center gap-1 text-[14px] text-[var(--pw-ink-2)] disabled:opacity-40 hover:text-[var(--pw-ink)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }),
            " Back"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            state.step < STEPS.length && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: goSkip, disabled: saving, className: "text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] px-3 py-2", children: "Skip for now" }),
            state.step < STEPS.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: goNext, disabled: saving, className: "pw-btn-primary inline-flex items-center gap-1 px-5 py-2.5 text-[14px] font-medium disabled:opacity-50", children: [
              saving ? "Saving…" : "Continue",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: publish, disabled: saving, className: "pw-btn-primary inline-flex items-center gap-1 px-6 py-2.5 text-[14px] font-medium disabled:opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
              " Publish profile"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function ProgressBar({
  step
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: [
      "Tutor onboarding · Step ",
      step,
      " of ",
      STEPS.length
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[30px] sm:text-[36px] leading-tight mt-2", children: STEPS[step - 1] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex gap-2", children: STEPS.map((label, i) => {
      const idx = i + 1;
      const done = idx < step;
      const active = idx === step;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full transition-colors", style: {
          background: done || active ? "var(--pw-accent)" : "var(--pw-border)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[10.5px] font-mono-pw uppercase pw-tracking-wide hidden sm:block", style: {
          color: active ? "var(--pw-ink)" : "var(--pw-ink-2)"
        }, children: label })
      ] }, label);
    }) })
  ] });
}
function Step1({
  state,
  update,
  userId
}) {
  const [cropFile, setCropFile] = reactExports.useState(null);
  const [crop, setCrop] = reactExports.useState({
    x: 0,
    y: 0
  });
  const [zoom, setZoom] = reactExports.useState(1);
  const [pixels, setPixels] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCropFile(reader.result);
    reader.readAsDataURL(f);
  }
  async function getCroppedBlob() {
    if (!cropFile || !pixels) return null;
    const img = new Image();
    img.src = cropFile;
    await new Promise((r) => {
      img.onload = r;
    });
    const size = Math.max(400, Math.min(pixels.width, pixels.height));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
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
      const {
        error
      } = await supabase.storage.from("profile-photos").upload(path, blob, {
        upsert: true,
        contentType: "image/jpeg"
      });
      if (error) throw error;
      const {
        data
      } = supabase.storage.from("profile-photos").getPublicUrl(path);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)]", children: "Tell students who you are." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-24 rounded-full overflow-hidden bg-[var(--pw-surface-2)] flex items-center justify-center pw-border border", children: state.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: state.avatar_url, alt: "", className: "size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "size-7 text-[var(--pw-ink-2)]" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Profile photo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12.5px] text-[var(--pw-ink-2)] mt-0.5", children: "Square 1:1, min 400×400px." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 inline-flex items-center gap-1.5 pw-pill pw-border border px-3 py-1.5 text-[13px] cursor-pointer bg-white hover:bg-[var(--pw-surface-2)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-3.5" }),
          " Choose photo",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: onPick })
        ] })
      ] })
    ] }),
    cropFile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4", onClick: () => !uploading && setCropFile(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl p-4 max-w-[480px] w-full", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[20px]", children: "Crop your photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-3 h-[320px] bg-black rounded-md overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cropper, { image: cropFile, crop, zoom, aspect: 1, onCropChange: setCrop, onZoomChange: setZoom, onCropComplete: (_a, p) => setPixels(p) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 1, max: 3, step: 0.01, value: zoom, onChange: (e) => setZoom(Number(e.target.value)), className: "w-full mt-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCropFile(null), disabled: uploading, className: "px-3 py-2 text-[13px]", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: confirmCrop, disabled: uploading, className: "pw-btn-primary px-4 py-2 text-[13px] disabled:opacity-50", children: uploading ? "Uploading…" : "Save photo" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: state.full_name, onChange: (e) => update("full_name", e.target.value), placeholder: "Jane Doe" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Headline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono-pw text-[11px]", style: {
          color: headlineLeft < 0 ? "var(--pw-danger)" : "var(--pw-ink-2)"
        }, children: [
          headlineLeft,
          " chars left"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: state.headline, maxLength: 140, onChange: (e) => update("headline", e.target.value), placeholder: "MIT-trained math tutor specializing in SAT prep" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bio (markdown supported)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 5, value: state.bio, onChange: (e) => update("bio", e.target.value), placeholder: "**About me…** Share your teaching style, experience, what you love.", className: "mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)] font-mono-pw" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Years of experience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 70, value: state.years_experience, onChange: (e) => update("years_experience", e.target.value), placeholder: "5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Education level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: state.education_level, onChange: (e) => update("education_level", e.target.value), className: "mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
          EDU_LEVELS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l, children: l }, l))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Institution" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: state.institution, onChange: (e) => update("institution", e.target.value), placeholder: "Stanford University" })
    ] })
  ] });
}
function Step2({
  state,
  update,
  subjects
}) {
  const [q, setQ] = reactExports.useState("");
  const [specInput, setSpecInput] = reactExports.useState("");
  const [superInput, setSuperInput] = reactExports.useState("");
  const filtered = reactExports.useMemo(() => {
    const t = q.trim().toLowerCase();
    return subjects.filter((s) => !t || s.name.toLowerCase().includes(t));
  }, [subjects, q]);
  function toggleSubject(id) {
    const has = state.subject_ids.includes(id);
    const next = has ? state.subject_ids.filter((x) => x !== id) : [...state.subject_ids, id];
    update("subject_ids", next);
    if (!has && !state.proficiency[id]) {
      update("proficiency", {
        ...state.proficiency,
        [id]: 3
      });
    }
  }
  function setProf(id, v) {
    update("proficiency", {
      ...state.proficiency,
      [id]: v
    });
  }
  function addTag(kind, val, setter) {
    const t = val.trim();
    if (!t) return;
    if (state[kind].includes(t)) {
      setter("");
      return;
    }
    update(kind, [...state[kind], t]);
    setter("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)]", children: "What do you teach, and what makes you stand out?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Subjects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pw-ink-2)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search subjects…", className: "w-full pw-border border rounded-md pl-9 pr-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2 max-h-[180px] overflow-y-auto", children: filtered.map((s) => {
        const on = state.subject_ids.includes(s.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => toggleSubject(s.id), className: "pw-pill border px-3 py-1.5 text-[13px] transition-colors", style: {
          borderColor: on ? "var(--pw-accent)" : "var(--pw-border)",
          background: on ? "var(--pw-accent-soft)" : "var(--pw-surface)",
          color: on ? "var(--pw-accent)" : "var(--pw-ink)"
        }, children: [
          on && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "inline size-3 mr-1" }),
          s.name
        ] }, s.id);
      }) })
    ] }),
    state.subject_ids.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Proficiency per subject" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-3", children: state.subject_ids.map((id) => {
        const subj = subjects.find((s) => s.id === id);
        if (!subj) return null;
        const v = state.proficiency[id] ?? 3;
        const labels = ["Beginner", "Novice", "Intermediate", "Advanced", "Expert"];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border border rounded-md p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[13px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: subj.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-pw text-[11px] text-[var(--pw-ink-2)]", children: labels[v - 1] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 1, max: 5, step: 1, value: v, onChange: (e) => setProf(id, Number(e.target.value)), className: "w-full mt-2 accent-[var(--pw-accent)]" })
        ] }, id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TagField, { label: "Specializations", helper: "e.g., AP Calculus, SAT Prep, Dyslexia Specialist", tags: state.specializations, input: specInput, setInput: setSpecInput, onAdd: () => addTag("specializations", specInput, setSpecInput), onRemove: (t) => update("specializations", state.specializations.filter((x) => x !== t)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TagField, { label: "Superpowers ✨", helper: "Highlighted on your profile — what you're truly best at", tags: state.superpowers, input: superInput, setInput: setSuperInput, onAdd: () => addTag("superpowers", superInput, setSuperInput), onRemove: (t) => update("superpowers", state.superpowers.filter((x) => x !== t)), accent: true })
  ] });
}
function TagField({
  label,
  helper,
  tags,
  input,
  setInput,
  onAdd,
  onRemove,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    helper && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[var(--pw-ink-2)] mt-0.5", children: helper }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAdd();
        }
      }, placeholder: "Type and press Enter", className: "flex-1 pw-border border rounded-md px-3 py-2 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onAdd, className: "pw-pill border pw-border px-3 text-[13px] bg-white hover:bg-[var(--pw-surface-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) })
    ] }),
    tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pw-pill border px-3 py-1 text-[12.5px] inline-flex items-center gap-1.5", style: {
      borderColor: accent ? "var(--pw-accent-3)" : "var(--pw-border)",
      background: accent ? "rgba(244,196,48,0.15)" : "var(--pw-surface)",
      color: accent ? "#8a6d00" : "var(--pw-ink)"
    }, children: [
      accent && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
      t,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onRemove(t), className: "opacity-60 hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
    ] }, t)) })
  ] });
}
function Step3({
  state,
  update,
  userId
}) {
  const [recording, setRecording] = reactExports.useState(false);
  const [previewUrl, setPreviewUrl] = reactExports.useState(state.video_intro_url);
  const [uploading, setUploading] = reactExports.useState(false);
  const videoRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  const streamRef = reactExports.useRef(null);
  const stopTimerRef = reactExports.useRef(null);
  reactExports.useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
  }, []);
  async function startRecord() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      const rec = new MediaRecorder(stream, {
        mimeType: "video/webm"
      });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm"
        });
        await uploadVideo(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setRecording(true);
      stopTimerRef.current = window.setTimeout(stopRecord, 12e4);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't access camera/microphone.");
    }
  }
  function stopRecord() {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }
  async function onUploadFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 60 * 1024 * 1024) {
      toast.error("Video too large (max ~60MB).");
      return;
    }
    await uploadVideo(f);
  }
  async function uploadVideo(blob) {
    setUploading(true);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const path = `${userId}/intro-${Date.now()}.${ext}`;
      const {
        error
      } = await supabase.storage.from("tutor-videos").upload(path, blob, {
        upsert: true,
        contentType: blob.type
      });
      if (error) throw error;
      const {
        data
      } = supabase.storage.from("tutor-videos").getPublicUrl(path);
      update("video_intro_url", data.publicUrl);
      setPreviewUrl(data.publicUrl);
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
  async function generateThumbnail(url, uid) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.src = url;
      v.muted = true;
      v.playsInline = true;
      v.onloadedmetadata = () => {
        v.currentTime = Math.min(5, (v.duration || 5) - 0.1);
      };
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
          const {
            error
          } = await supabase.storage.from("tutor-videos").upload(path, b, {
            upsert: true,
            contentType: "image/jpeg"
          });
          if (error) {
            console.warn("thumb upload", error);
            return resolve(null);
          }
          const {
            data
          } = supabase.storage.from("tutor-videos").getPublicUrl(path);
          resolve(data.publicUrl);
        }, "image/jpeg", 0.85);
      };
      v.onerror = () => resolve(null);
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)]", children: "A 60-90s intro video doubles your booking rate." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md p-4", style: {
      background: "var(--pw-accent-soft)",
      border: "1px solid var(--pw-accent)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide", style: {
        color: "var(--pw-accent)"
      }, children: "Tips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] mt-1", children: "Introduce yourself, share your teaching philosophy, and what makes you unique." })
    ] }),
    previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: previewUrl, controls: true, poster: state.video_thumbnail_url ?? void 0, className: "w-full rounded-md bg-black aspect-video" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setPreviewUrl(null);
        update("video_intro_url", null);
        update("video_thumbnail_url", null);
      }, className: "pw-pill border pw-border px-3 py-1.5 text-[13px] bg-white", children: "Re-record / Replace" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, className: "w-full rounded-md bg-black aspect-video" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        !recording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: startRecord, disabled: uploading, className: "pw-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[13px] disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-4" }),
          " Record now"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: stopRecord, className: "pw-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[13px]", style: {
          background: "var(--pw-danger)"
        }, children: "Stop recording" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "pw-pill border pw-border px-3 py-2 text-[13px] cursor-pointer bg-white inline-flex items-center gap-1.5 hover:bg-[var(--pw-surface-2)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-3.5" }),
          " Upload file",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "video/*", className: "hidden", onChange: onUploadFile })
        ] }),
        uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)] self-center", children: "Uploading…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11.5px] text-[var(--pw-ink-2)]", children: "Max 2 minutes. Thumbnail auto-generated at 5s." })
    ] })
  ] });
}
function Step4({
  state,
  update
}) {
  const set = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    state.availability.forEach((x) => s.add(`${x.day}-${x.hour}`));
    return s;
  }, [state.availability]);
  function toggle(day, hour) {
    const key = `${day}-${hour}`;
    const next = set.has(key) ? state.availability.filter((x) => `${x.day}-${x.hour}` !== key) : [...state.availability, {
      day,
      hour
    }];
    update("availability", next);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)]", children: "When are you available each week? Tap an hour to toggle." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timezone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: state.timezone, onChange: (e) => update("timezone", e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11.5px] text-[var(--pw-ink-2)] mt-1", children: "Auto-detected — you can change it." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buffer time between sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: state.buffer_minutes, onChange: (e) => update("buffer_minutes", Number(e.target.value)), className: "mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]", children: [0, 15, 30, 60].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: v, children: [
          v,
          " min"
        ] }, v)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Booking mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex gap-2", children: [{
        v: false,
        label: "Manual approval"
      }, {
        v: true,
        label: "Instant bookings"
      }].map((o) => {
        const on = state.instant_bookings === o.v;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => update("instant_bookings", o.v), className: "pw-pill border px-4 py-2 text-[13px]", style: {
          borderColor: on ? "var(--pw-accent)" : "var(--pw-border)",
          background: on ? "var(--pw-accent-soft)" : "var(--pw-surface)",
          color: on ? "var(--pw-accent)" : "var(--pw-ink)"
        }, children: o.label }, String(o.v));
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weekly availability" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 overflow-x-auto pw-border border rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-[11px] font-mono-pw", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-1.5 text-left text-[var(--pw-ink-2)]", children: "Hr" }),
          DAYS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-1.5 text-[var(--pw-ink-2)]", children: d }, d))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: HOURS.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t pw-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-1 text-[var(--pw-ink-2)]", children: h.toString().padStart(2, "0") }),
          DAYS.map((_, dayIdx) => {
            const on = set.has(`${dayIdx}-${h}`);
            return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggle(dayIdx, h), className: "w-full h-6 rounded-sm transition-colors", style: {
              background: on ? "var(--pw-accent)" : "var(--pw-surface-2)"
            }, "aria-label": `${DAYS[dayIdx]} ${h}:00` }) }, dayIdx);
          })
        ] }, h)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11.5px] text-[var(--pw-ink-2)] mt-1", children: [
        state.availability.length,
        " hourly slots selected"
      ] })
    ] })
  ] });
}
function Step5({
  state,
  update,
  subjects
}) {
  const rate = Number(state.hourly_rate) || 0;
  const selectedSubjects = subjects.filter((s) => state.subject_ids.includes(s.id));
  const marketRates = {
    "STEM": [40, 90],
    "Test Prep": [60, 120],
    "Languages": [30, 70],
    "Humanities": [35, 75]
  };
  const suggestion = selectedSubjects[0]?.category ? marketRates[selectedSubjects[0].category] : [40, 80];
  function updPkg(i, patch) {
    const next = state.packages.map((p, idx) => idx === i ? {
      ...p,
      ...patch
    } : p);
    update("packages", next);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default hourly rate (USD)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pw-ink-2)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: state.hourly_rate, onChange: (e) => update("hourly_rate", e.target.value), className: "w-full pw-border border rounded-md pl-9 pr-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]", placeholder: "50" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[12px] text-[var(--pw-ink-2)] mt-1", children: [
        "Suggested for your subjects: $",
        suggestion?.[0],
        "–$",
        suggestion?.[1],
        "/hr"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Package deals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "Encourage longer commitments with bundle discounts." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2", children: state.packages.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border border rounded-md p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: p.enabled, onChange: (e) => updPkg(i, {
          enabled: e.target.checked
        }), className: "accent-[var(--pw-accent)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] flex-1", children: [
          p.sessions,
          "-session pack · ",
          p.discount_percent,
          "% off",
          rate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)]", children: [
            " → $",
            (rate * p.sessions * (1 - p.discount_percent / 100)).toFixed(0),
            " total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, max: 50, value: p.discount_percent, onChange: (e) => updPkg(i, {
          discount_percent: Number(e.target.value)
        }), className: "w-16 pw-border border rounded px-2 py-1 text-[13px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "%" })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { checked: state.first_session_free, onChange: (v) => update("first_session_free", v), label: "First session free", helper: "A risk-free way for students to try you out" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { checked: state.free_discovery_call, onChange: (v) => update("free_discovery_call", v), label: "Free 15-min discovery call", helper: "Quick chat before booking a full session" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border border rounded-md p-4 bg-[var(--pw-surface-2)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Search preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-[24px]", children: [
          "$",
          rate || "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: "/ hour" }),
        state.first_session_free && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto pw-pill border pw-border px-2 py-0.5 text-[11px] bg-white", children: "First free" })
      ] }),
      state.packages.some((p) => p.enabled) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[12px] text-[var(--pw-accent)]", children: [
        "Save up to ",
        Math.max(...state.packages.filter((p) => p.enabled).map((p) => p.discount_percent)),
        "% with packages"
      ] })
    ] })
  ] });
}
function ToggleRow({
  checked,
  onChange,
  label,
  helper
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "pw-border border rounded-md p-3 flex items-center gap-3 cursor-pointer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: (e) => onChange(e.target.checked), className: "accent-[var(--pw-accent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13.5px] font-medium block", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: helper })
    ] })
  ] });
}
function Step6({
  state,
  subjects
}) {
  const missing = [];
  if (!state.full_name) missing.push("Full name");
  if (!state.headline) missing.push("Headline");
  if (!state.bio) missing.push("Bio");
  if (!state.avatar_url) missing.push("Profile photo");
  if (!state.subject_ids.length) missing.push("At least one subject");
  if (!state.video_intro_url) missing.push("Video intro");
  if (!state.availability.length) missing.push("Availability");
  if (!state.hourly_rate) missing.push("Hourly rate");
  const subjectNames = subjects.filter((s) => state.subject_ids.includes(s.id)).map((s) => s.name);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)]", children: "Here's how students will see your profile." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border border rounded-lg overflow-hidden", children: [
      state.video_thumbnail_url || state.video_intro_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video bg-black", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: state.video_thumbnail_url || "", alt: "", className: "w-full h-full object-cover opacity-80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-full bg-white/90 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "size-5" }) }) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-full overflow-hidden bg-[var(--pw-surface-2)] shrink-0", children: state.avatar_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: state.avatar_url, alt: "", className: "size-full object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[22px] leading-tight", children: state.full_name || "Your name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)] mt-0.5 line-clamp-2", children: state.headline || "Your headline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: subjectNames.slice(0, 4).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill border pw-border px-2 py-0.5 text-[11px] bg-[var(--pw-surface-2)]", children: n }, n)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-[22px]", children: [
              "$",
              state.hourly_rate || "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)]", children: "/hr" })
          ] })
        ] }),
        state.superpowers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: state.superpowers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pw-pill border px-2 py-0.5 text-[11px] inline-flex items-center gap-1", style: {
          borderColor: "var(--pw-accent-3)",
          background: "rgba(244,196,48,0.18)",
          color: "#8a6d00"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
          t
        ] }, t)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[13px] text-[var(--pw-ink)] whitespace-pre-wrap line-clamp-4", children: state.bio }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-3 text-[11.5px] text-[var(--pw-ink-2)] font-mono-pw uppercase pw-tracking-wide", children: [
          state.years_experience && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            state.years_experience,
            " yrs exp"
          ] }),
          state.education_level && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            state.education_level,
            state.institution ? `, ${state.institution}` : ""
          ] }),
          state.availability.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "inline size-3 mr-1" }),
            state.availability.length,
            " slots/wk"
          ] }),
          state.first_session_free && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--pw-accent)"
          }, children: "· First session free" })
        ] })
      ] })
    ] }),
    missing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-border border rounded-md p-4", style: {
      background: "rgba(224,90,90,0.06)",
      borderColor: "var(--pw-danger)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide", style: {
        color: "var(--pw-danger)"
      }, children: [
        "Still missing (",
        missing.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 text-[13px] list-disc list-inside text-[var(--pw-ink)]", children: missing.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: m }, m)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[var(--pw-ink-2)] mt-1", children: "You can still publish, but a complete profile gets 3× more bookings." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)] inline-flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3.5" }),
      " Your profile will enter verification review after publishing."
    ] })
  ] });
}
function Label({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] block", children });
}
function Input(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...props, className: "mt-1 w-full pw-border border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)] " + (props.className ?? "") });
}
export {
  TutorWizard as component
};
