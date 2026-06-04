import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Props {
  show: boolean;
  stageNumber: number;
  stageTitle: string;
  nextStageTitle?: string;
  onClose: () => void;
}

export function MilestoneCelebration({ show, stageNumber, stageTitle, nextStageTitle, onClose }: Props) {
  useEffect(() => {
    if (!show) return;
    // Burst
    const fire = (origin: { x: number; y: number }) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        colors: ["#E85D26", "#F4C430", "#2D6A4F", "#FFFFFF"],
        scalar: 1,
      });
    };
    fire({ x: 0.3, y: 0.5 });
    fire({ x: 0.7, y: 0.5 });
    setTimeout(() => fire({ x: 0.5, y: 0.4 }), 250);

    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(26,26,26,0.55)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="pw-card text-center px-8 py-10 max-w-md w-full"
            style={{ background: "var(--pw-surface)", borderColor: "var(--pw-accent)", borderWidth: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl mb-3"
            >
              🎉
            </motion.div>
            <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-accent)]">
              STAGE {String(stageNumber).padStart(2, "0")} COMPLETE
            </div>
            <h2 className="font-display text-[34px] leading-tight mt-2">{stageTitle}</h2>
            {nextStageTitle ? (
              <>
                <div className="my-4 h-px bg-[var(--pw-border)]" />
                <div className="font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]">
                  UNLOCKED
                </div>
                <p className="font-display text-[20px] mt-1">▶ {nextStageTitle}</p>
                <p className="text-[13px] text-[var(--pw-ink-2)] mt-2">Keep the streak going.</p>
              </>
            ) : (
              <>
                <div className="my-4 h-px bg-[var(--pw-border)]" />
                <p className="font-display text-[22px]">🏁 You reached your goal!</p>
                <p className="text-[13px] text-[var(--pw-ink-2)] mt-2">Every stage mastered. Outstanding.</p>
              </>
            )}
            <button
              onClick={onClose}
              className="pw-btn-primary mt-6 px-5 py-2.5 text-[14px] font-medium"
            >
              Continue →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
