import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { VerificationBadge, statusToTier } from "../pathwise/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings/verification")({
  head: () => ({ meta: [{ title: "Verification Center — PathWise" }] }),
  component: VerificationCenter,
});

type RequestRow = {
  id: string;
  type: "identity" | "background";
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  completed_at: string | null;
};

type Step = "upload" | "processing" | "verified";

export function VerificationCenter() {
  const { loading, isLoggedIn, profile, supabaseUser, openLogin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      openLogin();
      return;
    }
  }, [loading, isLoggedIn, openLogin]);

  useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;
    (async () => {
      setRequestsLoading(true);
      const { data, error } = await supabase
        .from("verification_requests")
        .select("id, type, status, submitted_at, completed_at")
        .eq("user_id", supabaseUser.id)
        .order("submitted_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error("Couldn't load verification requests.");
      } else {
        setRequests((data ?? []) as RequestRow[]);
      }
      setRequestsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
        <PWHeader />
        <main className="px-5 sm:px-8 py-20 max-w-md mx-auto text-center text-[14px] text-[var(--pw-ink-2)]">
          Loading…
        </main>
      </div>
    );
  }

  const emailVerified = !!supabaseUser?.email_confirmed_at || !!supabaseUser?.email;
  const identityStatus = profile.verification_status;
  const identityVerified = identityStatus === "verified";
  const pendingIdentity = requests.find((r) => r.type === "identity" && r.status === "pending");

  const tier = statusToTier(identityStatus);

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
          Settings
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[36px] leading-tight">Verification Center</h1>
          <VerificationBadge tier={tier} size="lg" />
        </div>
        <p className="mt-2 text-[15px] text-[var(--pw-ink-2)]">
          Verified tutors get a trust badge, rank higher in search, and earn up to 3× more bookings.
        </p>

        <div className="mt-8 space-y-4">
          {/* Tier 1 — Email */}
          <TierCard
            tone={emailVerified ? "done" : "todo"}
            title="Email Verified"
            subtitle="Confirms you own your account email."
            statusLabel={emailVerified ? "Complete" : "Pending"}
            actionLabel={null}
          >
            <div className="text-[13px] text-[var(--pw-ink-2)]">
              {supabaseUser?.email ? (
                <span>
                  ✓ <span className="text-[var(--pw-ink)] font-medium">{supabaseUser.email}</span>
                </span>
              ) : (
                "Sign in with an email account."
              )}
            </div>
          </TierCard>

          {/* Tier 2 — Identity */}
          <TierCard
            tone={identityVerified ? "done" : pendingIdentity ? "pending" : "todo"}
            title="Identity Verified"
            subtitle="Upload a government ID and a selfie. Most checks finish in 1–2 minutes."
            statusLabel={
              identityVerified ? "Verified" : pendingIdentity ? "In review" : "Not started"
            }
            actionLabel={
              identityVerified
                ? null
                : pendingIdentity
                  ? "View status"
                  : "Start verification"
            }
            onAction={() => setShowUpload(true)}
          >
            {pendingIdentity && !identityVerified ? (
              <div className="text-[13px] text-[var(--pw-ink-2)]">
                Submitted {new Date(pendingIdentity.submitted_at).toLocaleDateString()} — usually
                reviewed within 1–2 minutes.
              </div>
            ) : null}
          </TierCard>

          {/* Tier 3 — Background (coming soon) */}
          <TierCard
            tone="locked"
            title="Background Check (Premium)"
            subtitle="Adds a gold trust badge that highlights you across PathWise."
            statusLabel="Coming soon"
            actionLabel={null}
          >
            <div className="text-[13px] text-[var(--pw-ink-2)]">
              We're partnering with a verified background-check provider. Existing identity-verified
              tutors will be invited first.
            </div>
          </TierCard>
        </div>

        {/* Recent requests */}
        <section className="mt-12">
          <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-3">
            Submission history
          </div>
          {requestsLoading ? (
            <div className="pw-card p-4 animate-pulse h-16 bg-[var(--pw-surface-2)]" />
          ) : requests.length === 0 ? (
            <div className="pw-card p-4 text-[13px] text-[var(--pw-ink-2)]">
              No verification requests yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="pw-card p-3 flex items-center justify-between text-[13px]"
                >
                  <span className="capitalize">{r.type}</span>
                  <span
                    className="pw-pill px-2.5 py-1 text-[11px] uppercase pw-tracking-wide"
                    style={{
                      color:
                        r.status === "approved"
                          ? "var(--pw-accent-2)"
                          : r.status === "rejected"
                            ? "var(--pw-danger)"
                            : "#a16207",
                      background:
                        r.status === "approved"
                          ? "var(--pw-accent-soft)"
                          : r.status === "rejected"
                            ? "#fee2e2"
                            : "#fef3c7",
                      borderColor:
                        r.status === "approved"
                          ? "var(--pw-accent-2)"
                          : r.status === "rejected"
                            ? "var(--pw-danger)"
                            : "#f59e0b",
                      borderWidth: 1,
                      borderStyle: "solid",
                    }}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10">
          <Link
            to="/dashboard"
            className="text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] underline-offset-4 hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>

      <AnimatePresence>
        {showUpload && supabaseUser && (
          <UploadModal
            userId={supabaseUser.id}
            onClose={() => setShowUpload(false)}
            onSubmitted={async (row) => {
              setRequests((prev) => [row, ...prev]);
              await refreshProfile();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Tier card ---------------- */
function TierCard({
  tone,
  title,
  subtitle,
  statusLabel,
  actionLabel,
  onAction,
  children,
}: {
  tone: "done" | "pending" | "todo" | "locked";
  title: string;
  subtitle: string;
  statusLabel: string;
  actionLabel: string | null;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  const accent =
    tone === "done"
      ? "var(--pw-accent-2)"
      : tone === "pending"
        ? "#a16207"
        : tone === "locked"
          ? "var(--pw-ink-2)"
          : "var(--pw-accent)";

  return (
    <div className="pw-card p-5 sm:p-6" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[20px]">{title}</h3>
            <span
              className="pw-pill px-2 py-0.5 text-[10px] uppercase pw-tracking-wide"
              style={{
                color: accent,
                background: tone === "locked" ? "var(--pw-surface-2)" : `${accent}10`,
                borderColor: accent,
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-[14px] text-[var(--pw-ink-2)]">{subtitle}</p>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="pw-btn-primary px-4 py-2 text-[13px] whitespace-nowrap"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Upload modal ---------------- */
function UploadModal({
  userId,
  onClose,
  onSubmitted,
}: {
  userId: string;
  onClose: () => void;
  onSubmitted: (row: RequestRow) => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);

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
        supabase.storage
          .from("verification-documents")
          .upload(selfiePath, selfieFile, { upsert: false }),
      ]);
      if (idUp.error) throw idUp.error;
      if (selfieUp.error) throw selfieUp.error;

      const { data, error } = await supabase
        .from("verification_requests")
        .insert({
          user_id: userId,
          type: "identity",
          status: "pending",
          id_document_path: idPath,
          selfie_path: selfiePath,
        })
        .select("id, type, status, submitted_at, completed_at")
        .single();
      if (error) throw error;

      // Mirror to profile so badges update across the app.
      await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", userId);

      setStep("processing");
      // Simulate processing — Stripe Identity webhook would replace this.
      setTimeout(() => {
        setStep("verified");
        onSubmitted(data as RequestRow);
      }, 2200);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Upload failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="pw-card w-full max-w-lg p-6 sm:p-7 bg-[var(--pw-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Stepper step={step} />

        {step === "upload" && (
          <div className="mt-6 space-y-5">
            <h2 className="font-display text-[24px]">Verify your identity</h2>
            <p className="text-[13px] text-[var(--pw-ink-2)]">
              Your documents are encrypted and only used for verification.
            </p>

            <FileSlot
              label="Government-issued ID"
              hint="Driver's license, passport, or national ID. JPG / PNG / PDF."
              file={idFile}
              onPick={() => idInput.current?.click()}
            />
            <input
              ref={idInput}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              hidden
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
            />

            <FileSlot
              label="Selfie"
              hint="Hold your ID next to your face for biometric matching."
              file={selfieFile}
              onPick={() => selfieInput.current?.click()}
            />
            <input
              ref={selfieInput}
              type="file"
              accept="image/*"
              capture="user"
              hidden
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !idFile || !selfieFile}
                className="pw-btn-primary px-5 py-2.5 text-[14px] disabled:opacity-50"
              >
                {submitting ? "Uploading…" : "Submit for verification"}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="mt-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-[var(--pw-accent)] border-t-transparent animate-spin" />
            <h2 className="mt-5 font-display text-[22px]">Processing your documents</h2>
            <p className="mt-2 text-[13px] text-[var(--pw-ink-2)]">
              Estimated time: 1–2 minutes. You can safely close this window.
            </p>
          </div>
        )}

        {step === "verified" && (
          <div className="mt-8 text-center">
            <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full bg-[var(--pw-accent-soft)] text-[var(--pw-accent-2)] text-[28px]">
              ✓
            </div>
            <h2 className="mt-4 font-display text-[24px]">Submitted!</h2>
            <p className="mt-2 text-[13px] text-[var(--pw-ink-2)]">
              Your documents are in review. We'll email you when verification is complete.
            </p>
            <button
              onClick={onClose}
              className="pw-btn-primary mt-6 px-5 py-2.5 text-[14px]"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Processing" },
    { key: "verified", label: "Verified" },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = i <= idx;
        return (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-medium"
              style={{
                background: active ? "var(--pw-accent)" : "var(--pw-surface-2)",
                color: active ? "white" : "var(--pw-ink-2)",
              }}
            >
              {i + 1}
            </div>
            <div className="text-[12px] uppercase pw-tracking-wide" style={{ color: active ? "var(--pw-ink)" : "var(--pw-ink-2)" }}>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px" style={{ background: i < idx ? "var(--pw-accent)" : "var(--pw-border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileSlot({
  label,
  hint,
  file,
  onPick,
}: {
  label: string;
  hint: string;
  file: File | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full text-left pw-border rounded-md px-4 py-3 hover:bg-[var(--pw-surface-2)] transition-colors flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-md flex items-center justify-center bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] text-[18px]">
        {file ? "📎" : "📷"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-[var(--pw-ink)]">{label}</div>
        <div className="text-[12px] text-[var(--pw-ink-2)] truncate">
          {file ? file.name : hint}
        </div>
      </div>
      <div className="text-[12px] text-[var(--pw-accent)] font-medium">
        {file ? "Change" : "Upload"}
      </div>
    </button>
  );
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
}