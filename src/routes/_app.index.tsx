import { createFileRoute } from "@tanstack/react-router";
import { DemoBanner } from "../pathwise/DemoBanner";
import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { PortalHero } from "@/components/landing/PortalHero";
import { Statement } from "@/components/landing/Statement";
import { StepDeck } from "@/components/landing/StepDeck";
import { StageRoster } from "@/components/landing/StageRoster";
import { Voices } from "@/components/landing/Voices";
import { Footer } from "@/components/landing/Footer";
import { JourneyLine } from "@/components/landing/JourneyLine";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "PathWise — Find exactly where you stand" },
      {
        name: "description",
        content:
          "A 3-minute quiz reveals your level, builds your roadmap, and finds the right tutor. No guesswork. No wasted sessions.",
      },
      { property: "og:title", content: "PathWise — Find exactly where you stand" },
      {
        property: "og:description",
        content:
          "Discover your level, get a personalized roadmap, and meet matched tutors. Free, no signup.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PathWise",
          url: "/",
          description: "PathWise matches students with tutors and personalized learning roadmaps.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PathWise",
          url: "/",
          potentialAction: {
            "@type": "SearchAction",
            target: "/find-tutor?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  // The footer wordmark lights up once the journey line reaches it.
  const [arrived, setArrived] = useState(false);
  return (
    // Landing is always dark (QED design language), independent of the app theme toggle.
    <MotionConfig reducedMotion="user">
      <div className="relative bg-qed-ground font-sora text-qed-ink">
        <PortalHero />
        <Statement />
        <StepDeck />
        <StageRoster />
        <Voices />
        <Footer lit={arrived} />
        <JourneyLine onArrive={setArrived} />
      </div>
      {/* Outside the dark wrapper: the banner follows the app theme and inherits pw-ink, not qed-ink. */}
      <DemoBanner />
    </MotionConfig>
  );
}
