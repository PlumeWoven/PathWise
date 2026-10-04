import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Icon } from "@/components/Icon";

interface Props {
  show: boolean;
  stageNumber: number;
  stageTitle: string;
  nextStageTitle?: string;
  onClose: () => void;
}

export function MilestoneCelebration({
  show,
  stageNumber,
  stageTitle,
  nextStageTitle,
  onClose,
}: Props) {
  useEffect(() => {
    if (!show) return;
    // Burst
    const fire = (origin: { x: number; y: number }) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        colors: ["#e8913c", "#5fa3ab", "#ede7dc", "#2e6b72"],
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
          style={{ background: "rgba(10,12,14,0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="pw-card text-center px-8 py-10 max-w-md w-full shadow-pw-float"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-3 flex justify-center"
            >
              <Icon name="celebrate" className="h-12 w-12" />
            </motion.div>
            <div className="label-caps text-pw-accent">
              STAGE {String(stageNumber).padStart(2, "0")} COMPLETE
            </div>
            <h2 className="font-display font-bold uppercase tracking-[-0.025em] text-[2.125rem] leading-none mt-2">
              {stageTitle}
            </h2>
            {nextStageTitle ? (
              <>
                <div className="my-4 h-px bg-[var(--pw-border)]" />
                <div className="label-caps text-[var(--pw-ink-2)]">UNLOCKED</div>
                <p className="font-display font-bold uppercase tracking-[-0.025em] text-[1.25rem] mt-1 flex items-center justify-center gap-2">
                  <Icon name="play" className="h-5 w-5" />
                  {nextStageTitle}
                </p>
                <p className="text-[0.8125rem] text-[var(--pw-ink-2)] mt-2">Keep the streak going.</p>
              </>
            ) : (
              <>
                <div className="my-4 h-px bg-[var(--pw-border)]" />
                <p className="font-display text-[1.375rem] flex items-center justify-center gap-2">
                  <Icon name="flag" className="h-6 w-6" />
                  You reached your goal!
                </p>
                <p className="text-[0.8125rem] text-[var(--pw-ink-2)] mt-2">
                  Every stage mastered. Outstanding.
                </p>
              </>
            )}
            <button onClick={onClose} className="pw-btn-primary mt-6 px-5 py-2.5">
              Continue →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
