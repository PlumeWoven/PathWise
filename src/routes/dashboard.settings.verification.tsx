import { createFileRoute } from "@tanstack/react-router";
import VerificationPage from "./settings.verification";

export const Route = createFileRoute("/dashboard/settings/verification")({
    component: DashboardVerification,
});

function DashboardVerification() {
    return <VerificationPage />;
}