import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactLink, LegalPage, WHO_RUNS_IT } from "../pathwise/legal";

export const Route = createFileRoute("/_app/terms")({
  head: () => ({ meta: [{ title: "Terms of Use — PathWise" }] }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        {WHO_RUNS_IT}. By creating an account you agree to these terms and to our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <section>
        <h2>What PathWise is</h2>
        <p>
          PathWise helps students find their level, plan their learning and book lessons with
          independent tutors. Tutors are not our employees; each tutor is responsible for their own
          lessons. PathWise is in beta and is free to use.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <ul>
          <li>You must be 18 or older. Parents or guardians book on behalf of a child.</li>
          <li>Keep your login details private; you're responsible for activity on your account.</li>
          <li>Give accurate information, especially tutors about their qualifications.</li>
        </ul>
      </section>

      <section>
        <h2>Payments during the beta</h2>
        <p>
          PathWise does not take payments. Students pay tutors directly, in the way they agree with
          each other. Prices shown are the tutor's own rates in MDL. Any refund is agreed between
          the student and the tutor.
        </p>
      </section>

      <section>
        <h2>Cancellations</h2>
        <p>
          Either side can cancel a booking from its session page and the other side is notified.
          Please cancel at least 24 hours ahead; tutors may set their own policy for late
          cancellations and no-shows, and should tell students before the first lesson.
        </p>
      </section>

      <section>
        <h2>Tutor verification</h2>
        <p>
          A "verified" badge means we confirmed the tutor's identity and teaching background on a
          video call. It is not a guarantee of results.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>No harassment, discrimination or inappropriate contact, especially with minors.</li>
          <li>No fake profiles, fake reviews or impersonation.</li>
          <li>Don't try to break, overload or misuse the platform.</li>
        </ul>
        <p>We may suspend or close accounts that break these rules.</p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          We provide PathWise as is and do our best to keep it working. We aren't responsible for
          the content of lessons or for agreements between students and tutors, to the extent the
          law allows.
        </p>
      </section>

      <section>
        <h2>Changes and law</h2>
        <p>
          We'll announce material changes to these terms on the site before they apply. These terms
          are governed by the laws of the Republic of Moldova. Questions: <ContactLink />.
        </p>
      </section>
    </LegalPage>
  );
}
