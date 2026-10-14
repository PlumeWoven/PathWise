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
      { title: "PathWise · Math and English tutors in Moldova" },
      {
        name: "description",
        content:
          "A free 8-question level check in Math or English, a five-stage roadmap, and verified tutors in Moldova. Book here and pay your tutor directly.",
      },
      { property: "og:title", content: "PathWise · Math and English tutors in Moldova" },
      {
        property: "og:description",
        content:
          "Find your level in Math or English, get a five-stage roadmap and meet verified tutors. The level check is free and needs no account.",
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
          description:
            "PathWise matches students in Moldova with verified Math and English tutors, starting from a free level check.",
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
