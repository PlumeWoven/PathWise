import { createFileRoute } from "@tanstack/react-router";
import { ContactLink, LegalPage, WHO_RUNS_IT } from "../pathwise/legal";

export const Route = createFileRoute("/_app/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — PathWise" }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {WHO_RUNS_IT}. This page explains what we collect, why, and what you can
        ask us to do with it. Questions: <ContactLink />.
      </p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your email address, name, password (stored hashed) and role.</li>
          <li>
            Profile details you add. Tutor profiles (name, photo, bio, subjects, rate, video) are
            public so students can find you.
          </li>
          <li>Level-check answers, your learning roadmap and the preferences you give us.</li>
          <li>Bookings: who, when, the lesson link, status changes and any cancellation reason.</li>
          <li>Reviews you write about tutors.</li>
          <li>Anonymous page-view statistics (no cookies, no cross-site tracking).</li>
        </ul>
      </section>

      <section>
        <h2>Why</h2>
        <p>
          To run your account, match students with tutors, schedule lessons, send you booking
          notifications, keep the platform safe, and improve it. We don't sell your data or use it
          for advertising.
        </p>
      </section>

      <section>
        <h2>Who processes it</h2>
        <ul>
          <li>Supabase — database, sign-in and file storage, hosted in the EU (Ireland).</li>
          <li>Vercel — website hosting and anonymous analytics.</li>
          <li>
            Lessons happen on the video service in your booking (the tutor's Zoom or Google Meet
            link, or Jitsi Meet). Their own privacy policies apply there.
          </li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Accounts are for people aged 18 or over. Parents or guardians create the account and
          book lessons for a child.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          While your account exists. When you ask us to delete your account, we delete your
          profile, roadmap and bookings within 30 days, except what we must keep by law.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us for a copy of your data, to correct it, or to delete your account. Email{" "}
          <ContactLink /> from your account's address and we'll reply within 30 days.
        </p>
      </section>
    </LegalPage>
  );
}
