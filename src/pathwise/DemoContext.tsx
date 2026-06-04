import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export const DEMO_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const STORAGE_KEY = "pw-demo-started";
const VIEWS_KEY = "pw-demo-views";
const EMAIL_KEY = "pw-demo-email";

// ----- Canonical sample data (single source of truth) -----
export const DEMO_TUTOR = {
  id: "demo-tutor-1",
  name: "Alex Mereanu",
  username: "alex-demo",
  headline: "Senior Software Engineer · 8 yrs teaching",
  bio: "I help students go from zero to job-ready in modern web development. 500+ students mentored across 12 countries.",
  rating: 4.9,
  reviews: 127,
  students: 348,
  hourlyRate: 45,
  credentials: ["MSc Computer Science — TU Delft", "AWS Certified Solutions Architect", "Ex-Google Engineer"],
};

export const DEMO_COURSES = [
  {
    id: "c1",
    title: "Full-Stack JavaScript: From Zero to Production",
    category: "Programming",
    price: 89, discount: 49,
    students: 214, rating: 4.9, reviews: 86, lessons: 42, hours: 18,
    completion: 73,
    thumb: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    tutorId: "demo-tutor-1",
  },
  {
    id: "c2",
    title: "Build & Sell: A Practical Guide to Indie SaaS",
    category: "Business",
    price: 129, discount: null as number | null,
    students: 134, rating: 4.8, reviews: 41, lessons: 28, hours: 11,
    completion: 58,
    thumb: "linear-gradient(135deg,#f59e0b,#ef4444)",
    tutorId: "demo-tutor-1",
  },
];

export const DEMO_MESSAGES = [
  { id: 1, from: "Maria P.", avatar: "MP", time: "2h ago", preview: "Hi Alex! Loved lesson 12 — quick question about async patterns…", unread: true },
  { id: 2, from: "Daniel C.", avatar: "DC", time: "yesterday", preview: "Could we schedule a 1:1 next week to review my project?", unread: true },
  { id: 3, from: "Sarah K.", avatar: "SK", time: "3 days ago", preview: "Just finished the SaaS course — thank you, this was incredible.", unread: false },
];

export const DEMO_SESSIONS = [
  { id: "s1", student: "Maria P.", topic: "Async JS deep dive", when: "Today · 16:00", duration: 60 },
  { id: "s2", student: "Daniel C.", topic: "Project review", when: "Tomorrow · 10:30", duration: 45 },
  { id: "s3", student: "James L.", topic: "Career mentoring", when: "Fri · 14:00", duration: 30 },
];

export const DEMO_REVIEW = {
  student: "Maria P.", rating: 5, course: "Full-Stack JavaScript",
  body: "Alex's teaching style is unmatched. The exercises are practical, and his feedback in 1:1s helped me land my first dev job.",
};

// Stable, deterministic earnings (not random per render)
export const EARNINGS = [320, 480, 410, 690, 820, 940, 1180, 1340, 1510, 1620, 1890, 2240];

export type DemoView = "tutor" | "student";

interface DemoCtx {
  isDemo: true;
  view: DemoView;
  setView: (v: DemoView) => void;
  remaining: string;
  expired: boolean;
  warning: boolean;
  exitDemo: () => void;
  lockedFeature: (label?: string) => void;
  shareLink: () => Promise<string>;
  viewsForRef: (ref: string) => number;
  capturedEmail: string | null;
  captureEmail: (email: string) => void;
  data: {
    tutor: typeof DEMO_TUTOR;
    courses: typeof DEMO_COURSES;
    messages: typeof DEMO_MESSAGES;
    sessions: typeof DEMO_SESSIONS;
    review: typeof DEMO_REVIEW;
    earnings: typeof EARNINGS;
  };
}

const Ctx = createContext<DemoCtx | null>(null);

export function useDemo(): DemoCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo must be used inside <DemoProvider>");
  return c;
}

export function useDemoOptional(): DemoCtx | null {
  return useContext(Ctx);
}

export function DemoProvider({
  initialView,
  refCode,
  onExit,
  children,
}: {
  initialView: DemoView;
  refCode?: string;
  onExit: () => void;
  children: ReactNode;
}) {
  const [view, setView] = useState<DemoView>(initialView);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);

  // Init session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    let started = stored ? parseInt(stored, 10) : NaN;
    if (!started || Date.now() - started > DEMO_DURATION_MS) {
      started = Date.now();
    }
    sessionStorage.setItem(STORAGE_KEY, String(started));
    localStorage.setItem(STORAGE_KEY, String(started));
    setExpiresAt(started + DEMO_DURATION_MS);

    setCapturedEmail(localStorage.getItem(EMAIL_KEY));

    // Track view by ref
    if (refCode) {
      const data = JSON.parse(localStorage.getItem(VIEWS_KEY) ?? "{}");
      data[refCode] = (data[refCode] ?? 0) + 1;
      localStorage.setItem(VIEWS_KEY, JSON.stringify(data));
    }
  }, [refCode]);

  // Tick (1s is enough for mm:ss; raf would burn battery)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = expiresAt ? Math.max(0, expiresAt - now) : DEMO_DURATION_MS;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const remaining = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const expired = !!expiresAt && ms === 0;
  const warning = ms > 0 && ms <= 5 * 60 * 1000;

  const exitDemo = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
    onExit();
  }, [onExit]);

  const lockedFeature = useCallback((label = "this feature") => {
    toast.message("Sign up to unlock " + label, {
      description: "Demo mode is read-only. Create a free account to use it for real.",
      action: { label: "Sign up →", onClick: () => onExit() },
    });
  }, [onExit]);

  const shareLink = useCallback(async () => {
    if (typeof window === "undefined") return "";
    const ref = "demo" + Math.random().toString(36).slice(2, 8);
    const url = `${window.location.origin}/demo?ref=${ref}&as=${view}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Demo link copied!", { description: url });
    } catch {
      toast.error("Could not copy link");
    }
    return url;
  }, [view]);

  const viewsForRef = useCallback((ref: string) => {
    if (typeof window === "undefined") return 0;
    const data = JSON.parse(localStorage.getItem(VIEWS_KEY) ?? "{}");
    return data[ref] ?? 0;
  }, []);

  const captureEmail = useCallback((email: string) => {
    setCapturedEmail(email);
    if (typeof window !== "undefined") localStorage.setItem(EMAIL_KEY, email);
  }, []);

  const value: DemoCtx = useMemo(() => ({
    isDemo: true,
    view, setView,
    remaining, expired, warning,
    exitDemo, lockedFeature, shareLink, viewsForRef,
    capturedEmail, captureEmail,
    data: {
      tutor: DEMO_TUTOR, courses: DEMO_COURSES, messages: DEMO_MESSAGES,
      sessions: DEMO_SESSIONS, review: DEMO_REVIEW, earnings: EARNINGS,
    },
  }), [view, remaining, expired, warning, exitDemo, lockedFeature, shareLink, viewsForRef, capturedEmail, captureEmail]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
