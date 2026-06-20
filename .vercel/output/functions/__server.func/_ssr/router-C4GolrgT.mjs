import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { c as createRouter, u as useRouter, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, L as Link, d as useNavigate, H as HeadContent, S as Scripts, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
import { t as toast, T as Toaster } from "../_libs/sonner.mjs";
import { z as zodValidator, f as fallback } from "../_libs/tanstack__zod-adapter.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, L as Label2, S as Separator2, I as Item2, a as SubTrigger2, b as SubContent2, c as CheckboxItem2, d as ItemIndicator2, e as RadioItem2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { R as Root, V as Viewport, C as Corner, S as ScrollAreaScrollbar, a as ScrollAreaThumb } from "../_libs/radix-ui__react-scroll-area.mjs";
import { P as Plus, S as SquarePen, E as Eye, T as Trash2, a as TriangleAlert, G as Globe, C as Clock, b as Copy, c as Save, B as Bell, d as ChevronRight, e as Check, f as Circle } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { I as formatDistanceToNow, a as addDays, c as addWeeks, b as addMonths, w as isSameDay } from "../_libs/date-fns.mjs";
import { f as formatInTimeZone } from "../_libs/date-fns-tz.mjs";
import { o as objectType, a as coerce, s as stringType, e as enumType } from "../_libs/zod.mjs";
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
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/radix-ui__number.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const appCss = "/assets/styles-D3R-84Y2.css";
function createSupabaseClient() {
  const SUPABASE_URL = "https://tarnqywokrildahzhmjv.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MKPL7Bhv-kjU9E1_0Qpb_g_TGeiMtfS";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabase
}, Symbol.toStringTag, { value: "Module" }));
const AuthContext = reactExports.createContext(null);
async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("id, role, display_name, avatar_url, full_name, verification_status, onboarding_completed").eq("id", userId).maybeSingle();
  if (error) {
    console.error("[auth] fetchProfile error", error);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id,
    role: data.role ?? "student",
    display_name: data.display_name ?? null,
    avatar_url: data.avatar_url ?? null,
    full_name: data.full_name ?? null,
    verification_status: data.verification_status ?? "unverified",
    onboarding_completed: !!data.onboarding_completed
  };
}
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [loginOpen, setLoginOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => {
          fetchProfile(newSession.user.id).then((p) => {
            setProfile(p);
            if (event === "SIGNED_IN" && typeof window !== "undefined") {
              const path = window.location.pathname;
              const onPublicEntry = path === "/" || path === "/login";
              if (onPublicEntry) {
                claimAnonymousRecords(newSession.user.id).finally(() => {
                  if (!p) return;
                  if (!p.onboarding_completed) {
                    window.location.replace(p.role === "tutor" ? "/onboarding/tutor" : "/onboarding/student");
                    return;
                  }
                  window.location.replace(p.role === "tutor" ? "/dashboard" : "/roadmap");
                });
              }
            }
          });
        }, 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        fetchProfile(existing.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);
  const refreshProfile = async () => {
    if (session?.user) {
      const p = await fetchProfile(session.user.id);
      setProfile(p);
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };
  const supabaseUser = session?.user ?? null;
  const user = supabaseUser && profile ? {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: profile.display_name || supabaseUser.email?.split("@")[0] || "Learner",
    role: profile.role
  } : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: {
        session,
        supabaseUser,
        profile,
        user,
        role: profile?.role ?? null,
        isLoggedIn: !!session,
        loading,
        signOut,
        logout: signOut,
        loginOpen,
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        refreshProfile
      },
      children
    }
  );
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
async function claimAnonymousRecords(userId) {
  try {
    const diagId = localStorage.getItem("pathwise_diagnostic_id");
    const roadmapId = localStorage.getItem("pathwise_roadmap_id");
    if (diagId) {
      await supabase.from("diagnostic_results").update({ user_id: userId }).eq("id", diagId).is("user_id", null);
      localStorage.removeItem("pathwise_diagnostic_id");
    }
    if (roadmapId) {
      await supabase.from("roadmaps").update({ user_id: userId }).eq("id", roadmapId).is("user_id", null);
      localStorage.removeItem("pathwise_roadmap_id");
    }
  } catch (err) {
    console.error("[auth] claimAnonymousRecords", err);
  }
}
const lovableAuth = createLovableAuth();
const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams
        }
      });
      if (result.redirected) {
        return result;
      }
      if (result.error) {
        return result;
      }
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    }
  }
};
function LoginModal() {
  const { loginOpen, closeLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [role, setRole] = reactExports.useState(null);
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (loginOpen) {
      setMode("signin");
      setRole(null);
      setName("");
      setEmail("");
      setPassword("");
      setError("");
      setInfo("");
      setSubmitting(false);
    }
  }, [loginOpen]);
  if (!loginOpen) return null;
  const handleClose = () => closeLogin();
  async function routeAfterAuth(userId) {
    const { data: profile } = await supabase.from("profiles").select("role, onboarding_completed").eq("id", userId).maybeSingle();
    const r = profile?.role ?? "student";
    const onboarded = !!profile?.onboarding_completed;
    try {
      const diagId = localStorage.getItem("pathwise_diagnostic_id");
      const roadmapId = localStorage.getItem("pathwise_roadmap_id");
      if (diagId) {
        await supabase.from("diagnostic_results").update({ user_id: userId }).eq("id", diagId).is("user_id", null);
      }
      if (roadmapId) {
        await supabase.from("roadmaps").update({ user_id: userId }).eq("id", roadmapId).is("user_id", null);
      }
      localStorage.removeItem("pathwise_diagnostic_id");
      localStorage.removeItem("pathwise_roadmap_id");
    } catch (err) {
      console.error("[auth] claim anonymous error", err);
    }
    closeLogin();
    if (!onboarded) {
      navigate({ to: r === "tutor" ? "/onboarding/tutor" : "/onboarding/student" });
      return;
    }
    navigate({ to: r === "tutor" ? "/dashboard" : "/roadmap" });
  }
  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin
      });
      if (result.redirected) return;
      if (result.error) {
        setError(result.error.message || "Google sign-in failed");
        setSubmitting(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: existing } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
        if (!existing) {
          const fallbackName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Learner";
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              role: role ?? "student",
              display_name: fallbackName,
              full_name: fallbackName
            },
            { onConflict: "id" }
          );
        }
        await routeAfterAuth(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.user) await routeAfterAuth(data.user.id);
  }
  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please choose your role first.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/`;
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { role, display_name: name.trim(), full_name: name.trim() }
      }
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert(
        { id: data.user.id, role, display_name: name.trim(), full_name: name.trim() },
        { onConflict: "id" }
      );
      await routeAfterAuth(data.user.id);
    }
  }
  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setSubmitting(false);
    if (err) setError(err.message);
    else setInfo("Check your inbox for a password reset link.");
  }
  const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const subtitle = mode === "signin" ? "Choose how you're signing in" : mode === "signup" ? "Pick your role to get started" : "We'll email you a reset link";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center px-4",
      style: { background: "rgba(26,26,26,0.45)", backdropFilter: "blur(6px)" },
      onClick: handleClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "pw-card w-full max-w-[520px] p-7 relative",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleClose,
                "aria-label": "Close",
                className: "absolute right-4 top-4 text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] text-xl leading-none",
                children: "×"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[28px] leading-tight", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[14px] text-[var(--pw-ink-2)]", children: subtitle }),
            mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RoleCard,
                {
                  emoji: "🎓",
                  label: "Student",
                  sub: "Get a roadmap & tutor",
                  selected: role === "student",
                  onClick: () => {
                    setRole("student");
                    setError("");
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RoleCard,
                {
                  emoji: "👨‍🏫",
                  label: "Tutor",
                  sub: "Teach & earn",
                  selected: role === "tutor",
                  onClick: () => {
                    setRole("tutor");
                    setError("");
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RoleCard,
                {
                  emoji: "🔁",
                  label: "Both",
                  sub: "Learn and teach",
                  selected: role === "both",
                  onClick: () => {
                    setRole("both");
                    setError("");
                  }
                }
              )
            ] }),
            mode === "signin" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignIn, className: "mt-6 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: email, onChange: setEmail }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", value: password, onChange: setPassword }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorLine, { msg: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SubmitButton, { submitting, label: "Sign In →" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(OrDivider, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleButton, { onClick: handleGoogle, submitting }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px] text-[var(--pw-ink-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setMode("forgot");
                  setError("");
                  setInfo("");
                }, className: "underline-offset-4 hover:underline", children: "Forgot password?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setMode("signup");
                  setError("");
                  setInfo("");
                }, className: "underline-offset-4 hover:underline", children: "Create account" })
              ] })
            ] }),
            mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignUp, className: "mt-6 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", type: "text", value: name, onChange: setName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: email, onChange: setEmail }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", value: password, onChange: setPassword }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorLine, { msg: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SubmitButton, { submitting, label: "Create Free Account →", disabled: !role }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(OrDivider, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleButton, { onClick: handleGoogle, submitting, disabled: !role }),
              !role && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[var(--pw-ink-2)] text-center", children: "Pick a role above to enable Google sign-up." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)] text-center", children: [
                "Already have an account?",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setMode("signin");
                  setError("");
                  setInfo("");
                }, className: "underline-offset-4 hover:underline", children: "Sign in" })
              ] })
            ] }),
            mode === "forgot" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleForgot, className: "mt-6 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: email, onChange: setEmail }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorLine, { msg: error }),
              info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px]", style: { color: "var(--pw-accent-2)" }, children: info }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SubmitButton, { submitting, label: "Send reset link →" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setMode("signin");
                setError("");
                setInfo("");
              }, className: "underline-offset-4 hover:underline", children: "Back to sign in" }) })
            ] })
          ]
        }
      )
    }
  );
}
function RoleCard({
  emoji,
  label,
  sub,
  selected,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "pw-card text-left p-4 transition-colors",
      style: {
        borderColor: selected ? "var(--pw-accent)" : "var(--pw-border)",
        background: selected ? "var(--pw-accent-soft)" : "var(--pw-surface)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[16px] mt-1.5", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-0.5", children: sub })
      ]
    }
  );
}
function Field({
  label,
  type,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        required: true,
        value,
        onChange: (e) => onChange(e.target.value),
        className: "mt-1 w-full pw-border rounded-md px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[var(--pw-accent)]"
      }
    )
  ] });
}
function ErrorLine({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px]", style: { color: "var(--pw-danger)" }, children: msg });
}
function SubmitButton({
  submitting,
  label,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "submit",
      disabled: submitting || disabled,
      className: "pw-btn-primary w-full inline-flex justify-center items-center px-6 py-3 text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed",
      children: submitting ? "Please wait..." : label
    }
  );
}
function OrDivider() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-[var(--pw-border)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] font-mono-pw", children: "or" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-[var(--pw-border)]" })
  ] });
}
function GoogleButton({
  onClick,
  submitting,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      disabled: submitting || disabled,
      className: "w-full inline-flex justify-center items-center gap-2 pw-border rounded-md px-6 py-3 text-[14px] font-medium bg-white hover:bg-[var(--pw-surface-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 48 48", "aria-hidden": true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FFC107", d: "M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4CAF50", d: "M24 44c5.2 0 9.9-2 13.5-5.3l-6.2-5.3c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#1976D2", d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.3C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" })
        ] }),
        "Continue with Google"
      ]
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$w = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PathWise — Personalized Tutor Matching & Roadmaps" },
      { name: "description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { name: "author", content: "PathWise" },
      { property: "og:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      { property: "og:description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PathWise" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@PathWise" },
      { name: "twitter:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      { name: "twitter:description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoginModal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true })
  ] });
}
const BASE_URL = "";
const Route$v = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/quiz", changefreq: "monthly", priority: "0.9" },
          { path: "/find-tutor", changefreq: "weekly", priority: "0.9" },
          { path: "/matches", changefreq: "weekly", priority: "0.7" },
          { path: "/roadmap", changefreq: "weekly", priority: "0.7" },
          { path: "/demo", changefreq: "monthly", priority: "0.7" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$r = () => import("./roadmap-DgCtowl7.mjs");
const Route$u = createFileRoute("/roadmap")({
  validateSearch: (search) => ({
    roadmapId: typeof search.roadmapId === "string" ? search.roadmapId : void 0
  }),
  head: () => ({
    meta: [{
      title: "Your Roadmap — PathWise"
    }, {
      name: "description",
      content: "A personalized 5-stage learning roadmap built around your level and goal."
    }, {
      property: "og:title",
      content: "Your Roadmap — PathWise"
    }, {
      property: "og:description",
      content: "Visual learning journey from where you are to where you want to be."
    }, {
      property: "og:url",
      content: "/roadmap"
    }],
    links: [{
      rel: "canonical",
      href: "/roadmap"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./reset-password-Bpy1UV9y.mjs");
const Route$t = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset password — PathWise"
    }, {
      name: "description",
      content: "Set a new password for your PathWise account."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./quiz-ffvJNqdV.mjs");
const Route$s = createFileRoute("/quiz")({
  head: () => ({
    meta: [{
      title: "Level Check — PathWise"
    }, {
      name: "description",
      content: "Take a 3-minute gamified diagnostic to find your exact level."
    }, {
      property: "og:title",
      content: "Level Check — PathWise"
    }, {
      property: "og:description",
      content: "A short, fun diagnostic to reveal your starting level."
    }, {
      property: "og:url",
      content: "/quiz"
    }],
    links: [{
      rel: "canonical",
      href: "/quiz"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./matches-DNx4ZyAp.mjs");
const searchSchema$1 = objectType({
  subject: fallback(stringType().optional(), void 0).default(void 0),
  budget: fallback(coerce.number().optional(), void 0).default(void 0),
  level: fallback(stringType().optional(), void 0).default(void 0),
  style: fallback(stringType().optional(), void 0).default(void 0),
  sort: fallback(enumType(["best", "rating", "reviews", "price_asc", "price_desc"]), "best").default("best"),
  minRating: fallback(coerce.number().min(0).max(5), 0).default(0),
  priceMin: fallback(coerce.number().min(0), 0).default(0),
  priceMax: fallback(coerce.number().min(0), 200).default(200),
  vibes: fallback(stringType().array(), []).default([]),
  availableThisWeek: fallback(coerce.boolean(), false).default(false)
});
const Route$r = createFileRoute("/matches")({
  validateSearch: zodValidator(searchSchema$1),
  head: () => ({
    meta: [{
      title: "Your Matches — PathWise"
    }, {
      name: "description",
      content: "Tutors ranked for your learning style, subject, schedule and budget."
    }, {
      property: "og:title",
      content: "Your Matches — PathWise"
    }, {
      property: "og:description",
      content: "Personalized tutor matches with a transparent score breakdown."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./find-tutor-B5bN7anr.mjs");
const Route$q = createFileRoute("/find-tutor")({
  head: () => ({
    meta: [{
      title: "Find Your Tutor — PathWise"
    }, {
      name: "description",
      content: "Take a quick 8-question quiz and we'll match you with the perfect tutor."
    }, {
      property: "og:title",
      content: "Find Your Tutor — PathWise"
    }, {
      property: "og:description",
      content: "Take a quick 8-question quiz and we'll match you with the perfect tutor."
    }, {
      property: "og:url",
      content: "/find-tutor"
    }],
    links: [{
      rel: "canonical",
      href: "/find-tutor"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./demo-vprx2DRW.mjs");
const searchSchema = objectType({
  ref: fallback(stringType(), "").default(""),
  as: fallback(enumType(["tutor", "student"]), "tutor").default("tutor")
});
const Route$p = createFileRoute("/demo")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [{
      title: "Try Pathwise — Live Demo"
    }, {
      name: "description",
      content: "Experience Pathwise as a tutor or student. Sample data, no signup, 60 minute session."
    }, {
      property: "og:title",
      content: "Try Pathwise — Live Demo"
    }, {
      property: "og:description",
      content: "Explore the full tutor & student experience with sample data."
    }, {
      property: "og:url",
      content: "/demo"
    }],
    links: [{
      rel: "canonical",
      href: "/demo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./dashboard-33oFkuAb.mjs");
const Route$o = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./index-CmWkh-1D.mjs");
const Route$n = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "PathWise — Find exactly where you stand"
    }, {
      name: "description",
      content: "A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions."
    }, {
      property: "og:title",
      content: "PathWise — Find exactly where you stand"
    }, {
      property: "og:description",
      content: "Discover your level, get a personalized roadmap, and meet matched tutors. Free, no signup."
    }, {
      property: "og:url",
      content: "/"
    }],
    links: [{
      rel: "canonical",
      href: "/"
    }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PathWise",
        url: "/",
        description: "PathWise matches students with tutors and personalized learning roadmaps."
      })
    }, {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PathWise",
        url: "/",
        potentialAction: {
          "@type": "SearchAction",
          target: "/find-tutor?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./sessions.index-C_yB5aX8.mjs");
const Route$m = createFileRoute("/sessions/")({
  head: () => ({
    meta: [{
      title: "My sessions — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./dashboard.index-HKlRqsZr.mjs");
const Route$l = createFileRoute("/dashboard/")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./tutor._tutorId-D5PQVlvQ.mjs");
const Route$k = createFileRoute("/tutor/$tutorId")({
  head: ({
    params
  }) => ({
    meta: [{
      title: `Tutor profile — PathWise`
    }, {
      name: "description",
      content: "View this tutor's expertise, courses, reviews and availability."
    }, {
      property: "og:title",
      content: "Tutor profile — PathWise"
    }, {
      property: "og:description",
      content: "View this tutor's expertise, courses, reviews and availability."
    }, {
      property: "og:type",
      content: "profile"
    }, {
      property: "og:url",
      content: `/tutor/${params.tutorId}`
    }],
    links: [{
      rel: "canonical",
      href: `/tutor/${params.tutorId}`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
function statusToTier(status, hasEmail = true) {
  if (status === "verified") return "identity";
  return hasEmail ? "email" : "unverified";
}
const TIERS = {
  unverified: {
    label: "Unverified",
    color: "var(--pw-ink-2)",
    bg: "var(--pw-surface-2)",
    border: "var(--pw-border)",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldIcon, {})
  },
  email: {
    label: "Email Verified",
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheckIcon, {})
  },
  identity: {
    label: "ID Verified",
    color: "var(--pw-accent-2)",
    bg: "var(--pw-accent-soft)",
    border: "var(--pw-accent-2)",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheckIcon, {})
  },
  premium: {
    label: "Premium Verified",
    color: "#854d0e",
    bg: "#fef9c3",
    border: "#facc15",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StarShieldIcon, {})
  }
};
function VerificationBadge({
  tier,
  size = "md",
  className = ""
}) {
  const t = TIERS[tier];
  const sizing = size === "sm" ? "px-2 py-0.5 text-[10px] gap-1" : size === "lg" ? "px-3 py-1.5 text-[13px] gap-2" : "px-2.5 py-1 text-[11px] gap-1.5";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `pw-pill inline-flex items-center font-medium uppercase pw-tracking-wide ${sizing} ${className}`,
      style: { color: t.color, background: t.bg, borderColor: t.border, borderWidth: 1, borderStyle: "solid" },
      title: t.label,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "inline-flex items-center", children: t.icon }),
        t.label
      ]
    }
  );
}
function ShieldIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) });
}
function ShieldCheckIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m9 12 2 2 4-4" })
  ] });
}
function StarShieldIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "1", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2 4 5v7c0 6 8 10 8 10s8-4 8-10V5l-8-3z", opacity: "0.25" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12 7 1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 15.2 8.8 16.9l.6-3.6L6.8 10.8l3.6-.5L12 7z" })
  ] });
}
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
async function saveDiagnosticResult(input) {
  const { data, error } = await supabase.from("diagnostic_results").insert({
    user_id: input.user_id ?? null,
    subject: input.subject,
    goal: input.goal,
    score: input.score,
    level: input.level,
    xp_earned: input.xp_earned,
    wrong_topics: input.wrong_topics
  }).select("id").single();
  if (error) throw error;
  return data.id;
}
async function createRoadmap(params) {
  const { data: roadmap, error: roadmapErr } = await supabase.from("roadmaps").insert({
    user_id: params.user_id,
    diagnostic_id: params.diagnostic_id,
    subject: params.subject,
    goal: params.goal,
    current_stage: 1,
    total_stages: params.stages.length
  }).select("id").single();
  if (roadmapErr) throw roadmapErr;
  const stageRows = params.stages.map((s) => ({
    roadmap_id: roadmap.id,
    stage_number: s.stage_number,
    title: s.title,
    skills: s.skills,
    status: s.status
  }));
  const { error: stagesErr } = await supabase.from("roadmap_stages").insert(stageRows);
  if (stagesErr) throw stagesErr;
  return roadmap.id;
}
async function completeStage(roadmapId, stageNumber) {
  const { error: completeErr } = await supabase.from("roadmap_stages").update({ status: "complete", completed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("roadmap_id", roadmapId).eq("stage_number", stageNumber);
  if (completeErr) throw completeErr;
  const { error: unlockErr } = await supabase.from("roadmap_stages").update({ status: "active" }).eq("roadmap_id", roadmapId).eq("stage_number", stageNumber + 1);
  if (unlockErr && unlockErr.code !== "PGRST116") throw unlockErr;
  const { error: roadmapErr } = await supabase.from("roadmaps").update({ current_stage: stageNumber + 1 }).eq("id", roadmapId);
  if (roadmapErr) throw roadmapErr;
}
async function recordProfileView(tutorId, viewerId) {
  await supabase.from("profile_views").insert({
    tutor_id: tutorId,
    viewer_id: viewerId ?? null
  });
}
async function getNotifications(userId) {
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}
async function markNotificationRead(notificationId) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  if (error) throw error;
}
async function markAllNotificationsRead(userId) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  if (error) throw error;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function NotificationBell({ userId }) {
  const [notifications, setNotifications] = reactExports.useState([]);
  const [unreadCount, setUnreadCount] = reactExports.useState(0);
  const [open, setOpen] = reactExports.useState(false);
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };
  reactExports.useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel(`notifications:${userId}:${Math.random()}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const newNotif = payload.new;
        setNotifications((prev) => [newNotif, ...prev]);
        if (!newNotif.read) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    ).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const updated = payload.new;
        setNotifications(
          (prev) => prev.map((n) => n.id === updated.id ? updated : n)
        );
        if (!updated.read) {
          setUnreadCount((prev) => prev + 1);
        } else {
          setNotifications((current) => {
            const newUnread = current.filter((n) => !n.read).length;
            setUnreadCount(newUnread);
            return current;
          });
        }
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    setNotifications(
      (prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };
  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "icon", className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white", children: unreadCount > 9 ? "9+" : unreadCount })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-80", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Notifications" }),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleMarkAllRead,
            className: "text-xs text-[var(--pw-accent)] hover:underline",
            children: "Mark all as read"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[300px]", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-sm text-[var(--pw-ink-2)]", children: "No notifications yet" }) : notifications.map((notif) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          className: `flex flex-col items-start p-3 cursor-pointer ${!notif.read ? "bg-[var(--pw-accent-soft)]" : ""}`,
          onClick: () => {
            if (!notif.read) handleMarkRead(notif.id);
            if (notif.link) {
              window.location.href = notif.link;
            }
            setOpen(false);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: notif.title }),
            notif.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--pw-ink-2)] mt-0.5", children: notif.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--pw-ink-3)] mt-1", children: formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true
            }) })
          ]
        },
        notif.id
      )) })
    ] })
  ] });
}
function PWHeader() {
  const { isLoggedIn, user, profile, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.pageYOffset > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleSignOut = () => {
    logout();
    navigate({ to: "/" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "header",
    {
      className: "sticky top-0 z-50 w-full px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 transition-all duration-200 backdrop-blur-md",
      style: {
        background: scrolled ? "color-mix(in oklab, var(--pw-bg) 95%, transparent)" : "color-mix(in oklab, var(--pw-bg) 70%, transparent)",
        borderBottom: scrolled ? "1px solid var(--pw-border)" : "1px solid transparent"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display italic text-[24px] leading-none text-[var(--pw-ink)]", children: "PathWise" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1 pw-border-accent text-[var(--pw-accent)] uppercase pw-tracking-wide", children: "Beta — Free" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: isLoggedIn && user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-[13px] text-[var(--pw-ink-2)]", children: user.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, { userId: user.id }),
          (user.role === "tutor" || user.role === "both") && profile ? /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationBadge, { tier: statusToTier(profile.verification_status), size: "sm" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-1 pw-border text-[var(--pw-ink-2)] uppercase pw-tracking-wide", children: user.role }),
          (user.role === "tutor" || user.role === "both") && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/dashboard",
              className: "pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors",
              activeProps: { style: { background: "var(--pw-accent-soft)" } },
              children: "Dashboard"
            }
          ) }),
          (user.role === "student" || user.role === "both") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/roadmap",
                className: "pw-pill px-3 py-1.5 text-[13px] pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors",
                children: "My Roadmap"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/find-tutor",
                className: "pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex",
                children: "Find a tutor"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/sessions",
                className: "pw-pill px-3 py-1.5 text-[13px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors hidden sm:inline-flex",
                children: "My sessions"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleSignOut,
              className: "text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] underline-offset-4 hover:underline",
              children: "Sign Out"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: openLogin,
            className: "pw-pill px-4 py-1.5 text-[14px] pw-border text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)] transition-colors",
            children: "Sign In"
          }
        ) })
      ]
    }
  );
}
const Route$j = createFileRoute("/settings/verification")({
  head: () => ({ meta: [{ title: "Verification Center — PathWise" }] }),
  component: VerificationCenter
});
function VerificationCenter() {
  const { loading, isLoggedIn, profile, supabaseUser, openLogin, refreshProfile } = useAuth();
  useNavigate();
  const [requests, setRequests] = reactExports.useState([]);
  const [requestsLoading, setRequestsLoading] = reactExports.useState(true);
  const [showUpload, setShowUpload] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
  }, [loading, isLoggedIn, openLogin]);
  reactExports.useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;
    (async () => {
      setRequestsLoading(true);
      const { data, error } = await supabase.from("verification_requests").select("id, type, status, submitted_at, completed_at").eq("user_id", supabaseUser.id).order("submitted_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error("Couldn't load verification requests.");
      } else {
        setRequests(data ?? []);
      }
      setRequestsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);
  if (loading || !profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5 sm:px-8 py-20 max-w-md mx-auto text-center text-[14px] text-[var(--pw-ink-2)]", children: "Loading…" })
    ] });
  }
  const emailVerified = !!supabaseUser?.email_confirmed_at || !!supabaseUser?.email;
  const identityStatus = profile.verification_status;
  const identityVerified = identityStatus === "verified";
  const pendingIdentity = requests.find((r) => r.type === "identity" && r.status === "pending");
  const tier = statusToTier(identityStatus);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-3xl mx-auto px-5 sm:px-8 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[36px] leading-tight", children: "Verification Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationBadge, { tier, size: "lg" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[15px] text-[var(--pw-ink-2)]", children: "Verified tutors get a trust badge, rank higher in search, and earn up to 3× more bookings." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TierCard,
          {
            tone: emailVerified ? "done" : "todo",
            title: "Email Verified",
            subtitle: "Confirms you own your account email.",
            statusLabel: emailVerified ? "Complete" : "Pending",
            actionLabel: null,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: supabaseUser?.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "✓ ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink)] font-medium", children: supabaseUser.email })
            ] }) : "Sign in with an email account." })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TierCard,
          {
            tone: identityVerified ? "done" : pendingIdentity ? "pending" : "todo",
            title: "Identity Verified",
            subtitle: "Upload a government ID and a selfie. Most checks finish in 1–2 minutes.",
            statusLabel: identityVerified ? "Verified" : pendingIdentity ? "In review" : "Not started",
            actionLabel: identityVerified ? null : pendingIdentity ? "View status" : "Start verification",
            onAction: () => setShowUpload(true),
            children: pendingIdentity && !identityVerified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: [
              "Submitted ",
              new Date(pendingIdentity.submitted_at).toLocaleDateString(),
              " — usually reviewed within 1–2 minutes."
            ] }) : null
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TierCard,
          {
            tone: "locked",
            title: "Background Check (Premium)",
            subtitle: "Adds a gold trust badge that highlights you across PathWise.",
            statusLabel: "Coming soon",
            actionLabel: null,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: "We're partnering with a verified background-check provider. Existing identity-verified tutors will be invited first." })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3", children: "Submission history" }),
        requestsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-4 animate-pulse h-16 bg-[var(--pw-surface-2)]" }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-4 text-[13px] text-[var(--pw-ink-2)]", children: "No verification requests yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: requests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: "pw-card p-3 flex items-center justify-between text-[13px]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: r.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "pw-pill px-2.5 py-1 text-[11px] uppercase pw-tracking-wide",
                  style: {
                    color: r.status === "approved" ? "var(--pw-accent-2)" : r.status === "rejected" ? "var(--pw-danger)" : "#a16207",
                    background: r.status === "approved" ? "var(--pw-accent-soft)" : r.status === "rejected" ? "#fee2e2" : "#fef3c7",
                    borderColor: r.status === "approved" ? "var(--pw-accent-2)" : r.status === "rejected" ? "var(--pw-danger)" : "#f59e0b",
                    borderWidth: 1,
                    borderStyle: "solid"
                  },
                  children: r.status
                }
              )
            ]
          },
          r.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/dashboard",
          className: "text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] underline-offset-4 hover:underline",
          children: "← Back to dashboard"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showUpload && supabaseUser && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UploadModal,
      {
        userId: supabaseUser.id,
        onClose: () => setShowUpload(false),
        onSubmitted: async (row) => {
          setRequests((prev) => [row, ...prev]);
          await refreshProfile();
        }
      }
    ) })
  ] });
}
function TierCard({
  tone,
  title,
  subtitle,
  statusLabel,
  actionLabel,
  onAction,
  children
}) {
  const accent = tone === "done" ? "var(--pw-accent-2)" : tone === "pending" ? "#a16207" : tone === "locked" ? "var(--pw-ink-2)" : "var(--pw-accent)";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card p-5 sm:p-6", style: { borderLeft: `3px solid ${accent}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[20px]", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "pw-pill px-2 py-0.5 text-[10px] uppercase pw-tracking-wide",
            style: {
              color: accent,
              background: tone === "locked" ? "var(--pw-surface-2)" : `${accent}10`,
              borderColor: accent,
              borderWidth: 1,
              borderStyle: "solid"
            },
            children: statusLabel
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[14px] text-[var(--pw-ink-2)]", children: subtitle }),
      children ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children }) : null
    ] }),
    actionLabel && onAction && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onAction,
        className: "pw-btn-primary px-4 py-2 text-[13px] whitespace-nowrap",
        children: actionLabel
      }
    )
  ] }) });
}
function UploadModal({
  userId,
  onClose,
  onSubmitted
}) {
  const [step, setStep] = reactExports.useState("upload");
  const [idFile, setIdFile] = reactExports.useState(null);
  const [selfieFile, setSelfieFile] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const idInput = reactExports.useRef(null);
  const selfieInput = reactExports.useRef(null);
  async function handleSubmit() {
    if (!idFile || !selfieFile) {
      toast.error("Please add both a government ID and a selfie.");
      return;
    }
    setSubmitting(true);
    try {
      const ts = Date.now();
      const idPath = `${userId}/${ts}-id-${sanitize(idFile.name)}`;
      const selfiePath = `${userId}/${ts}-selfie-${sanitize(selfieFile.name)}`;
      const [idUp, selfieUp] = await Promise.all([
        supabase.storage.from("verification-documents").upload(idPath, idFile, { upsert: false }),
        supabase.storage.from("verification-documents").upload(selfiePath, selfieFile, { upsert: false })
      ]);
      if (idUp.error) throw idUp.error;
      if (selfieUp.error) throw selfieUp.error;
      const { data, error } = await supabase.from("verification_requests").insert({
        user_id: userId,
        type: "identity",
        status: "pending",
        id_document_path: idPath,
        selfie_path: selfiePath
      }).select("id, type, status, submitted_at, completed_at").single();
      if (error) throw error;
      await supabase.from("profiles").update({ verification_status: "pending" }).eq("id", userId);
      setStep("processing");
      setTimeout(() => {
        setStep("verified");
        onSubmitted(data);
      }, 2200);
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Upload failed. Please try again.");
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 20, opacity: 0 },
          className: "pw-card w-full max-w-lg p-6 sm:p-7 bg-white",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { step }),
            step === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[24px]", children: "Verify your identity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)]", children: "Your documents are encrypted and only used for verification." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FileSlot,
                {
                  label: "Government-issued ID",
                  hint: "Driver's license, passport, or national ID. JPG / PNG / PDF.",
                  file: idFile,
                  onPick: () => idInput.current?.click()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: idInput,
                  type: "file",
                  accept: "image/*,application/pdf",
                  capture: "environment",
                  hidden: true,
                  onChange: (e) => setIdFile(e.target.files?.[0] ?? null)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FileSlot,
                {
                  label: "Selfie",
                  hint: "Hold your ID next to your face for biometric matching.",
                  file: selfieFile,
                  onPick: () => selfieInput.current?.click()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: selfieInput,
                  type: "file",
                  accept: "image/*",
                  capture: "user",
                  hidden: true,
                  onChange: (e) => setSelfieFile(e.target.files?.[0] ?? null)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "px-4 py-2 text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleSubmit,
                    disabled: submitting || !idFile || !selfieFile,
                    className: "pw-btn-primary px-5 py-2.5 text-[14px] disabled:opacity-50",
                    children: submitting ? "Uploading…" : "Submit for verification"
                  }
                )
              ] })
            ] }),
            step === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 rounded-full border-2 border-[var(--pw-accent)] border-t-transparent animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 font-display text-[22px]", children: "Processing your documents" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] text-[var(--pw-ink-2)]", children: "Estimated time: 1–2 minutes. You can safely close this window." })
            ] }),
            step === "verified" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full bg-[var(--pw-accent-soft)] text-[var(--pw-accent-2)] text-[28px]", children: "✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-display text-[24px]", children: "Submitted!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13px] text-[var(--pw-ink-2)]", children: "Your documents are in review. We'll email you when verification is complete." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "pw-btn-primary mt-6 px-5 py-2.5 text-[14px]",
                  children: "Done"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function Stepper({ step }) {
  const steps = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Processing" },
    { key: "verified", label: "Verified" }
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: steps.map((s, i) => {
    const active = i <= idx;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-medium",
          style: {
            background: active ? "var(--pw-accent)" : "var(--pw-surface-2)",
            color: active ? "white" : "var(--pw-ink-2)"
          },
          children: i + 1
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] uppercase pw-tracking-wide", style: { color: active ? "var(--pw-ink)" : "var(--pw-ink-2)" }, children: s.label }),
      i < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: i < idx ? "var(--pw-accent)" : "var(--pw-border)" } })
    ] }, s.key);
  }) });
}
function FileSlot({
  label,
  hint,
  file,
  onPick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onPick,
      className: "w-full text-left pw-border rounded-md px-4 py-3 hover:bg-[var(--pw-surface-2)] transition-colors flex items-center gap-3",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-md flex items-center justify-center bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] text-[18px]", children: file ? "📎" : "📷" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium text-[var(--pw-ink)]", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] truncate", children: file ? file.name : hint })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-accent)] font-medium", children: file ? "Change" : "Upload" })
      ]
    }
  );
}
function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
}
const $$splitNotFoundComponentImporter$1 = () => import("./sessions._id-Dvs1gRl0.mjs");
const $$splitErrorComponentImporter$1 = () => import("./sessions._id-DorCSA77.mjs");
const $$splitComponentImporter$g = () => import("./sessions._id-BPRRHg7w.mjs");
const Route$i = createFileRoute("/sessions/$id")({
  head: () => ({
    meta: [{
      title: "Session — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
const $$splitComponentImporter$f = () => import("./pathwise.demo-CU2KmD9i.mjs");
const Route$h = createFileRoute("/pathwise/demo")({
  validateSearch: (s) => ({
    as: s.as === "student" || s.as === "tutor" ? s.as : void 0,
    code: typeof s.code === "string" ? s.code : void 0,
    ref: typeof s.ref === "string" ? s.ref : void 0
  }),
  head: () => ({
    meta: [{
      title: "Pathwise Demo — Try the platform with sample data"
    }, {
      name: "description",
      content: "Explore Pathwise as a tutor or student. No signup. Real-looking sample data."
    }, {
      property: "og:title",
      content: "Pathwise Demo Mode"
    }, {
      property: "og:description",
      content: "See the full tutor dashboard and student experience in 60 seconds."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./onboarding.tutor-BxF4fl72.mjs");
const Route$g = createFileRoute("/onboarding/tutor")({
  head: () => ({
    meta: [{
      title: "Tutor onboarding — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./onboarding.student-DBZq4RSU.mjs");
const Route$f = createFileRoute("/onboarding/student")({
  head: () => ({
    meta: [{
      title: "Welcome — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./dashboard.settings-D1Eff5lR.mjs");
const Route$e = createFileRoute("/dashboard/settings")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./dashboard.messages-DPPHB6aw.mjs");
const Route$d = createFileRoute("/dashboard/messages")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./dashboard.earnings-Dw_UM4jI.mjs");
const Route$c = createFileRoute("/dashboard/earnings")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./dashboard.courses-FpcUB86C.mjs");
const Route$b = createFileRoute("/dashboard/courses")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./dashboard.calendar-BtbxcgWS.mjs");
const Route$a = createFileRoute("/dashboard/calendar")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./dashboard.analytics-DcbNb8li.mjs");
const Route$9 = createFileRoute("/dashboard/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const DEFAULT_FAQ = [{
  q: "Do I get lifetime access?",
  a: "Yes — once enrolled you can revisit any lesson at any time."
}, {
  q: "Is there a money-back guarantee?",
  a: "We offer a 14-day no-questions-asked refund on every paid course."
}, {
  q: "Will I receive a certificate?",
  a: "Certificates are issued automatically when the certificate option is enabled by the tutor."
}, {
  q: "Can I message the tutor?",
  a: "Yes — enrolled students can start a thread directly with their tutor from the dashboard."
}];
const $$splitComponentImporter$6 = () => import("./courses._slug-DHOoXw7T.mjs");
const Route$8 = createFileRoute("/courses/$slug")({
  head: ({
    params
  }) => ({
    meta: [{
      title: "Course — PathWise"
    }, {
      name: "description",
      content: "Explore this course on PathWise — lessons, reviews, and tutor details."
    }, {
      property: "og:title",
      content: "Course — PathWise"
    }, {
      property: "og:description",
      content: "Explore this course on PathWise — lessons, reviews, and tutor details."
    }, {
      property: "og:type",
      content: "article"
    }, {
      property: "og:url",
      content: `/courses/${params.slug}`
    }],
    links: [{
      rel: "canonical",
      href: `/courses/${params.slug}`
    }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: DEFAULT_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a
          }
        }))
      })
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitNotFoundComponentImporter = () => import("./book._tutorId-B2fWG3eu.mjs");
const $$splitErrorComponentImporter = () => import("./book._tutorId-D7arC4SM.mjs");
const $$splitComponentImporter$5 = () => import("./book._tutorId-DtqIE3Z-.mjs");
const Route$7 = createFileRoute("/book/$tutorId")({
  head: () => ({
    meta: [{
      title: "Book a session — PathWise"
    }, {
      name: "description",
      content: "Pick a session type, time, and confirm your booking."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const $$splitComponentImporter$4 = () => import("./admin.review-DmXTlab4.mjs");
const Route$6 = createFileRoute("/admin/review")({
  head: () => ({
    meta: [{
      title: "Course Review — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
function TutorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("tutor_id", user.id).order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load courses");
        console.error(error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    })();
  }, [user]);
  const deleteCourse = async (courseId) => {
    if (!confirm("Delete this course permanently?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast.error("Failed to delete course");
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted");
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center", children: "Loading courses..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "My Courses" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/tutor/courses/new", className: "pw-btn-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " New Course"
      ] })
    ] }),
    courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-12 text-center text-[var(--pw-ink-2)]", children: [
      "You haven't created any courses yet.",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tutor/courses/new", className: "block mt-2 text-[var(--pw-accent)] underline", children: "Create your first course" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: courses.map((course) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-4", children: [
      course.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: course.thumbnail_url, alt: course.title, className: "w-full h-32 object-cover rounded-md mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: course.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)] mt-1 line-clamp-2", children: course.subtitle || "No description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full ${course.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`, children: course.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tutor/courses/$courseId/edit", params: { courseId: course.id }, className: "p-1 hover:bg-[var(--pw-surface-2)] rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/courses/$slug", params: { slug: course.slug || course.id }, className: "p-1 hover:bg-[var(--pw-surface-2)] rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteCourse(course.id), className: "p-1 hover:bg-red-100 rounded text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] })
      ] })
    ] }, course.id)) })
  ] });
}
const Route$5 = createFileRoute("/tutor/courses/")({
  component: TutorCoursesPage
});
const $$splitComponentImporter$3 = () => import("./dashboard.settings.index-fHZRzUJq.mjs");
const Route$4 = createFileRoute("/dashboard/settings/")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const COMMON_TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland"
];
function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
function tzAbbreviation(date, tz) {
  try {
    return formatInTimeZone(date, tz, "zzz");
  } catch {
    return tz;
  }
}
function fmtInTz(date, tz, fmt = "EEE, MMM d · h:mm a") {
  try {
    return formatInTimeZone(date, tz, fmt);
  } catch {
    return date.toString();
  }
}
function detectDSTShifts(start, tz, weeks) {
  const baseOffset = formatInTimeZone(start, tz, "xxx");
  const out = [];
  for (let i = 1; i < weeks; i++) {
    const d = addWeeks(start, i);
    if (formatInTimeZone(d, tz, "xxx") !== baseOffset) out.push(d);
  }
  return out;
}
function expandRecurrence(opts) {
  const cap = opts.maxOccurrences;
  const out = [];
  let cursor = opts.start;
  for (let i = 0; i < cap; i++) {
    if (opts.endDate && cursor > opts.endDate) break;
    out.push(cursor);
    if (opts.count && out.length >= opts.count) break;
    cursor = opts.frequency === "weekly" ? addWeeks(cursor, 1) : opts.frequency === "biweekly" ? addWeeks(cursor, 2) : addMonths(cursor, 1);
  }
  return out;
}
function buildAvailableSlots(cfg) {
  const days = cfg.daysAhead;
  const dur = cfg.durationMin;
  const buf = cfg.bufferMin ?? 0;
  const minAdvance = cfg.minAdvanceHours ?? 24;
  const earliest = new Date(Date.now() + minAdvance * 60 * 60 * 1e3);
  const out = [];
  const today = /* @__PURE__ */ new Date();
  for (let d = 0; d < days; d++) {
    const day = addDays(today, d);
    const dow = day.getDay();
    const blocks = cfg.availability.filter((a) => a.day_of_week === dow && !a.is_blocked);
    for (const b of blocks) {
      for (let hr = b.start_hour; hr + dur / 60 <= b.end_hour; hr++) {
        const slot = new Date(day);
        slot.setHours(hr, 0, 0, 0);
        if (slot < earliest) continue;
        const slotEnd = new Date(slot.getTime() + dur * 60 * 1e3);
        const conflict = (cfg.booked ?? []).some(
          (bk) => slot.getTime() < bk.end.getTime() + buf * 60 * 1e3 && slotEnd.getTime() + buf * 60 * 1e3 > bk.start.getTime()
        );
        if (!conflict) out.push(slot);
      }
    }
  }
  return out;
}
function groupSlotsByDay(slots) {
  const map = /* @__PURE__ */ new Map();
  for (const s of slots) {
    const k = s.toDateString();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(s);
  }
  return map;
}
function hasSlotsOn(date, slots) {
  return slots.some((s) => isSameDay(s, date));
}
function offsetDifferenceLabel(a, tzA, tzB) {
  try {
    const oa = formatInTimeZone(a, tzA, "xxx");
    const ob = formatInTimeZone(a, tzB, "xxx");
    if (oa === ob) return null;
    return `${tzA} (${oa}) vs ${tzB} (${ob})`;
  } catch {
    return null;
  }
}
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUFFER_OPTIONS = [0, 15, 30, 60];
function TutorAvailabilityPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [grid, setGrid] = reactExports.useState({});
  const [tz, setTz] = reactExports.useState(detectTimezone());
  const [bookedSlots, setBookedSlots] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bufferMinutes, setBufferMinutes] = reactExports.useState(15);
  const [minAdvanceHours, setMinAdvanceHours] = reactExports.useState(24);
  const [instantBookings, setInstantBookings] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [tzMismatch, setTzMismatch] = reactExports.useState(null);
  const dragMode = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!isLoggedIn) return;
    void loadAll();
  }, [isLoggedIn, user?.id]);
  async function loadAll() {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, availRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("timezone, buffer_minutes, instant_bookings, min_advance_hours").eq("id", user.id).maybeSingle(),
        supabase.from("tutor_availability").select("day_of_week, start_hour, end_hour, is_blocked").eq("user_id", user.id),
        supabase.from("sessions").select("scheduled_start, scheduled_end").eq("tutor_id", user.id).in("status_v2", ["scheduled", "confirmed", "reminder_sent", "in_progress"])
      ]);
      const p = profileRes.data ?? {};
      const detected = detectTimezone();
      const profileTz = p.timezone || detected;
      setTz(profileTz);
      if (p.timezone && p.timezone !== detected) {
        setTzMismatch(`Your browser is in ${detected} but your profile is set to ${p.timezone}.`);
      }
      setBufferMinutes(p.buffer_minutes ?? 15);
      setInstantBookings(!!p.instant_bookings);
      setMinAdvanceHours(p.min_advance_hours ?? 24);
      const next = {};
      for (const row of availRes.data ?? []) {
        for (let h = row.start_hour; h < row.end_hour; h++) {
          next[`${row.day_of_week}-${h}`] = row.is_blocked ? "blocked" : "available";
        }
      }
      setGrid(next);
      const booked = /* @__PURE__ */ new Set();
      for (const s of sessionsRes.data ?? []) {
        if (!s.scheduled_start) continue;
        const d = new Date(s.scheduled_start);
        booked.add(`${d.getDay()}-${d.getHours()}`);
      }
      setBookedSlots(booked);
    } finally {
      setLoading(false);
    }
  }
  function cellState(day, hour) {
    const key = `${day}-${hour}`;
    if (bookedSlots.has(key)) return "booked";
    return grid[key] ?? "free";
  }
  function paint(day, hour, mode) {
    const key = `${day}-${hour}`;
    if (bookedSlots.has(key)) return;
    setGrid((g) => ({ ...g, [key]: mode }));
  }
  function nextMode(current) {
    if (current === "free") return "available";
    if (current === "available") return "blocked";
    return "free";
  }
  function onCellMouseDown(day, hour) {
    const cur = cellState(day, hour);
    if (cur === "booked") return;
    const target = nextMode(cur);
    dragMode.current = target;
    paint(day, hour, target);
  }
  function onCellEnter(day, hour) {
    if (dragMode.current === null) return;
    paint(day, hour, dragMode.current);
  }
  function copyMondayToAll() {
    setGrid((g) => {
      const next = { ...g };
      for (let h = 0; h < 24; h++) {
        const src = next[`1-${h}`];
        for (const day of [2, 3, 4, 5, 6, 0]) {
          const k = `${day}-${h}`;
          if (bookedSlots.has(k)) continue;
          if (src) next[k] = src;
          else delete next[k];
        }
      }
      return next;
    });
    toast.success("Copied Monday to all weekdays + weekend");
  }
  function compactGrid() {
    const ranges = [];
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      let runStart = null;
      let runBlocked = false;
      for (let h = 0; h < 25; h++) {
        const state = h < 24 ? grid[`${day}-${h}`] : void 0;
        const active = state === "available" || state === "blocked";
        const blocked = state === "blocked";
        if (active && runStart === null) {
          runStart = h;
          runBlocked = blocked;
        } else if (active && runStart !== null && blocked !== runBlocked) {
          ranges.push({ day_of_week: day, start_hour: runStart, end_hour: h, is_blocked: runBlocked });
          runStart = h;
          runBlocked = blocked;
        } else if (!active && runStart !== null) {
          ranges.push({ day_of_week: day, start_hour: runStart, end_hour: h, is_blocked: runBlocked });
          runStart = null;
        }
      }
    }
    return ranges;
  }
  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const ranges = compactGrid();
      const { error: delErr } = await supabase.from("tutor_availability").delete().eq("user_id", user.id);
      if (delErr) throw delErr;
      if (ranges.length) {
        const { error: insErr } = await supabase.from("tutor_availability").insert(
          ranges.map((r) => ({ ...r, user_id: user.id }))
        );
        if (insErr) throw insErr;
      }
      const { error: profErr } = await supabase.from("profiles").update({
        timezone: tz,
        buffer_minutes: bufferMinutes,
        instant_bookings: instantBookings,
        min_advance_hours: minAdvanceHours
      }).eq("id", user.id);
      if (profErr) throw profErr;
      toast.success("Availability saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }
  if (!isLoggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-md mx-auto px-5 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Sign in required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)] mt-2", children: "Tutors only — please sign in." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({ to: "/" }), className: "pw-btn-outline mt-4 px-4 py-2 text-sm", children: "Home" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", onMouseUp: () => dragMode.current = null, onMouseLeave: () => dragMode.current = null, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 py-6 max-w-5xl mx-auto pb-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl", children: "Your weekly availability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)] mt-1", children: "Click a cell to mark it available. Click again to block it (vacation/time off). Drag to paint multiple cells." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "pw-btn-outline px-4 py-2 text-sm", children: "Back to dashboard" })
      ] }),
      tzMismatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card mt-4 p-3 flex items-start gap-3 border-l-4", style: { borderLeftColor: "var(--pw-warning, #d97706)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: [
          tzMismatch,
          " Update below if needed."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card mt-4 p-4 grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-3 h-3" }),
            " Timezone"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: tz, onChange: (e) => setTz(e.target.value), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white", children: [tz, ...COMMON_TIMEZONES.filter((t) => t !== tz)].map((z2) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: z2, children: z2 }, z2)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-[var(--pw-ink-2)] mt-1", children: [
            "Current: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: tz })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
            " Buffer between sessions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: bufferMinutes, onChange: (e) => setBufferMinutes(Number(e.target.value)), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white", children: BUFFER_OPTIONS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b === 0 ? "No buffer" : `${b} min` }, b)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Min advance booking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: minAdvanceHours, onChange: (e) => setMinAdvanceHours(Number(e.target.value)), className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] bg-white", children: [2, 6, 12, 24, 48, 72].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: h, children: [
            h,
            " hours"
          ] }, h)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Instant bookings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setInstantBookings((v) => !v),
              className: "mt-1 w-full pw-border rounded-md px-2 py-2 text-[13px] text-left",
              style: { background: instantBookings ? "var(--pw-accent-soft)" : "white" },
              children: instantBookings ? "On — auto-confirm" : "Off — you confirm each one"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "#10B981", label: "Available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "#9CA3AF", label: "Blocked / time off" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "#3B82F6", label: "Booked" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "white", label: "Free", border: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyMondayToAll, className: "pw-btn-outline px-3 py-1.5 text-[12px] flex items-center gap-1.5 ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3 h-3" }),
          " Copy Monday to all days"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: save, disabled: saving, className: "pw-btn-primary px-4 py-1.5 text-[12px] flex items-center gap-1.5 disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3 h-3" }),
          " ",
          saving ? "Saving…" : "Save"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "pw-card mt-4 overflow-x-auto select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[640px] p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[60px_repeat(7,1fr)] gap-px", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        DAYS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] py-1", children: d }, d)),
        HOURS.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(Hour, { hour: h, cellState, onMouseDown: onCellMouseDown, onMouseEnter: onCellEnter }, h))
      ] }) }) }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--pw-ink-2)] mt-4", children: "Loading…" })
    ] })
  ] });
}
function Hour({ hour, cellState, onMouseDown, onMouseEnter }) {
  const label = reactExports.useMemo(() => {
    const ampm = hour < 12 ? "am" : "pm";
    const hr = hour % 12 === 0 ? 12 : hour % 12;
    return `${hr}${ampm}`;
  }, [hour]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right pr-2 font-mono-pw text-[11px] text-[var(--pw-ink-2)] py-1", children: label }),
    DAY_INDEX.map((day) => {
      const state = cellState(day, hour);
      const bg = state === "available" ? "#10B981" : state === "blocked" ? "#9CA3AF" : state === "booked" ? "#3B82F6" : "white";
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onMouseDown: () => onMouseDown(day, hour),
          onMouseEnter: () => onMouseEnter(day, hour),
          className: "h-7 rounded cursor-pointer pw-border hover:opacity-80 transition-opacity",
          style: { background: bg, opacity: state === "booked" ? 0.9 : 1 },
          title: `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]} ${hour}:00 — ${state}`
        },
        `${day}-${hour}`
      );
    })
  ] });
}
function Legend({ color, label, border }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded", style: { background: color, border: border ? "1px solid var(--pw-border)" : void 0 } }),
    label
  ] });
}
const Route$3 = createFileRoute("/tutor/settings/availability")({
  head: () => ({
    meta: [
      { title: "Availability — PathWise" },
      { name: "description", content: "Set your weekly availability, buffer time, and time off." }
    ]
  }),
  component: TutorAvailabilityPage
});
const $$splitComponentImporter$2 = () => import("./tutor.courses.new-DVeta_A7.mjs");
const Route$2 = createFileRoute("/tutor/courses/new")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./dashboard.settings.verification-C4dFKaFU.mjs");
const Route$1 = createFileRoute("/dashboard/settings/verification")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./tutor.courses._courseId.edit-BKV1QK11.mjs");
const Route = createFileRoute("/tutor/courses/$courseId/edit")({
  head: () => ({
    meta: [{
      title: "Edit Course — PathWise"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SitemapDotxmlRoute = Route$v.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$w
});
const RoadmapRoute = Route$u.update({
  id: "/roadmap",
  path: "/roadmap",
  getParentRoute: () => Route$w
});
const ResetPasswordRoute = Route$t.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$w
});
const QuizRoute = Route$s.update({
  id: "/quiz",
  path: "/quiz",
  getParentRoute: () => Route$w
});
const MatchesRoute = Route$r.update({
  id: "/matches",
  path: "/matches",
  getParentRoute: () => Route$w
});
const FindTutorRoute = Route$q.update({
  id: "/find-tutor",
  path: "/find-tutor",
  getParentRoute: () => Route$w
});
const DemoRoute = Route$p.update({
  id: "/demo",
  path: "/demo",
  getParentRoute: () => Route$w
});
const DashboardRoute = Route$o.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$w
});
const IndexRoute = Route$n.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$w
});
const SessionsIndexRoute = Route$m.update({
  id: "/sessions/",
  path: "/sessions/",
  getParentRoute: () => Route$w
});
const DashboardIndexRoute = Route$l.update({
  id: "/",
  path: "/",
  getParentRoute: () => DashboardRoute
});
const TutorTutorIdRoute = Route$k.update({
  id: "/tutor/$tutorId",
  path: "/tutor/$tutorId",
  getParentRoute: () => Route$w
});
const SettingsVerificationRoute = Route$j.update({
  id: "/settings/verification",
  path: "/settings/verification",
  getParentRoute: () => Route$w
});
const SessionsIdRoute = Route$i.update({
  id: "/sessions/$id",
  path: "/sessions/$id",
  getParentRoute: () => Route$w
});
const PathwiseDemoRoute = Route$h.update({
  id: "/pathwise/demo",
  path: "/pathwise/demo",
  getParentRoute: () => Route$w
});
const OnboardingTutorRoute = Route$g.update({
  id: "/onboarding/tutor",
  path: "/onboarding/tutor",
  getParentRoute: () => Route$w
});
const OnboardingStudentRoute = Route$f.update({
  id: "/onboarding/student",
  path: "/onboarding/student",
  getParentRoute: () => Route$w
});
const DashboardSettingsRoute = Route$e.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => DashboardRoute
});
const DashboardMessagesRoute = Route$d.update({
  id: "/messages",
  path: "/messages",
  getParentRoute: () => DashboardRoute
});
const DashboardEarningsRoute = Route$c.update({
  id: "/earnings",
  path: "/earnings",
  getParentRoute: () => DashboardRoute
});
const DashboardCoursesRoute = Route$b.update({
  id: "/courses",
  path: "/courses",
  getParentRoute: () => DashboardRoute
});
const DashboardCalendarRoute = Route$a.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => DashboardRoute
});
const DashboardAnalyticsRoute = Route$9.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => DashboardRoute
});
const CoursesSlugRoute = Route$8.update({
  id: "/courses/$slug",
  path: "/courses/$slug",
  getParentRoute: () => Route$w
});
const BookTutorIdRoute = Route$7.update({
  id: "/book/$tutorId",
  path: "/book/$tutorId",
  getParentRoute: () => Route$w
});
const AdminReviewRoute = Route$6.update({
  id: "/admin/review",
  path: "/admin/review",
  getParentRoute: () => Route$w
});
const TutorCoursesIndexRoute = Route$5.update({
  id: "/tutor/courses/",
  path: "/tutor/courses/",
  getParentRoute: () => Route$w
});
const DashboardSettingsIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => DashboardSettingsRoute
});
const TutorSettingsAvailabilityRoute = Route$3.update({
  id: "/tutor/settings/availability",
  path: "/tutor/settings/availability",
  getParentRoute: () => Route$w
});
const TutorCoursesNewRoute = Route$2.update({
  id: "/tutor/courses/new",
  path: "/tutor/courses/new",
  getParentRoute: () => Route$w
});
const DashboardSettingsVerificationRoute = Route$1.update({
  id: "/verification",
  path: "/verification",
  getParentRoute: () => DashboardSettingsRoute
});
const TutorCoursesCourseIdEditRoute = Route.update({
  id: "/tutor/courses/$courseId/edit",
  path: "/tutor/courses/$courseId/edit",
  getParentRoute: () => Route$w
});
const DashboardSettingsRouteChildren = {
  DashboardSettingsVerificationRoute,
  DashboardSettingsIndexRoute
};
const DashboardSettingsRouteWithChildren = DashboardSettingsRoute._addFileChildren(DashboardSettingsRouteChildren);
const DashboardRouteChildren = {
  DashboardAnalyticsRoute,
  DashboardCalendarRoute,
  DashboardCoursesRoute,
  DashboardEarningsRoute,
  DashboardMessagesRoute,
  DashboardSettingsRoute: DashboardSettingsRouteWithChildren,
  DashboardIndexRoute
};
const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  DashboardRoute: DashboardRouteWithChildren,
  DemoRoute,
  FindTutorRoute,
  MatchesRoute,
  QuizRoute,
  ResetPasswordRoute,
  RoadmapRoute,
  SitemapDotxmlRoute,
  AdminReviewRoute,
  BookTutorIdRoute,
  CoursesSlugRoute,
  OnboardingStudentRoute,
  OnboardingTutorRoute,
  PathwiseDemoRoute,
  SessionsIdRoute,
  SettingsVerificationRoute,
  TutorTutorIdRoute,
  SessionsIndexRoute,
  TutorCoursesNewRoute,
  TutorSettingsAvailabilityRoute,
  TutorCoursesIndexRoute,
  TutorCoursesCourseIdEditRoute
};
const routeTree = Route$w._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  client as A,
  Button as B,
  COMMON_TIMEZONES as C,
  DEFAULT_FAQ as D,
  router as E,
  PWHeader as P,
  Route$u as R,
  TutorCoursesPage as T,
  VerificationBadge as V,
  saveDiagnosticResult as a,
  createRoadmap as b,
  completeStage as c,
  Route$r as d,
  Route$p as e,
  statusToTier as f,
  getCurrentUser as g,
  Route$k as h,
  Route$i as i,
  TutorAvailabilityPage as j,
  cn as k,
  buttonVariants as l,
  Route$7 as m,
  detectTimezone as n,
  buildAvailableSlots as o,
  groupSlotsByDay as p,
  offsetDifferenceLabel as q,
  recordProfileView as r,
  supabase as s,
  detectDSTShifts as t,
  useAuth as u,
  expandRecurrence as v,
  tzAbbreviation as w,
  hasSlotsOn as x,
  fmtInTz as y,
  VerificationCenter as z
};
