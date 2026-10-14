import { createFileRoute } from "@tanstack/react-router";
import { VerificationCenter } from "./_app.settings.verification";

export const Route = createFileRoute("/dashboard/settings/verification")({
  head: () => ({ meta: [{ title: "Verification Center · PathWise" }] }),
  component: DashboardVerification,
});

function DashboardVerification() {
  return <VerificationCenter />;
}
