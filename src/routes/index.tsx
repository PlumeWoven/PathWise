import { createFileRoute } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";
import { DemoBanner } from "../pathwise/DemoBanner";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
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
  return (
    <div className="min-h-screen bg-pw-bg text-pw-ink">
      <PWHeader />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
      <DemoBanner />
    </div>
  );
}
