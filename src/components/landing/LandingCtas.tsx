import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "@/pathwise/auth";

const primary =
  "group label-caps inline-flex items-center justify-center gap-2 px-8 py-4 bg-qed-ink text-qed-ground hover:bg-qed-amber transition-colors";
const secondary =
  "label-caps inline-flex items-center justify-center px-8 py-4 border border-qed-hairline text-qed-ink hover:border-qed-ink transition-colors";

/** Auth-aware CTA pair: tutors go to their dashboard, everyone else to the quiz / tutor search. */
export function LandingCtas({ className = "" }: { className?: string }) {
  const { isLoggedIn, role } = useAuth();
  const arrow = (
    <ArrowRightIcon
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  );

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {isLoggedIn && role === "tutor" ? (
        <Link to="/dashboard" className={primary}>
          Go to your dashboard {arrow}
        </Link>
      ) : (
        <>
          <Link to="/quiz" className={primary}>
            Start your level check {arrow}
          </Link>
          <Link to="/find-tutor" className={secondary}>
            Find a tutor
          </Link>
        </>
      )}
    </div>
  );
}
