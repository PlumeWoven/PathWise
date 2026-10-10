import { createFileRoute } from "@tanstack/react-router";
import { ContactLink, LegalPage } from "../pathwise/legal";

export const Route = createFileRoute("/_app/contact")({
  head: () => ({ meta: [{ title: "Contact — PathWise" }] }),
  component: Contact,
});

function Contact() {
  return (
    <LegalPage title="Contact">
      <p>
        Email <ContactLink />. We reply within 2 business days.
      </p>
      <section>
        <h2>Write to us about</h2>
        <ul>
          <li>Problems with a booking, a lesson or a tutor.</li>
          <li>Reporting inappropriate behaviour — we act on these first.</li>
          <li>Getting verified as a tutor.</li>
          <li>
            A copy of your data or deleting your account — send it from your account's email
            address.
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}
