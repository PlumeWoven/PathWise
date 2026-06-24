# Key Flows

- **Student Journey:** Landing → role (student) → quiz → diagnostic result → roadmap → find tutor → book session → attend → review.
- **Tutor Journey:** Landing → role (tutor) → 6‑step onboarding → dashboard → add availability → create courses → receive bookings → earn.
- **Admin Impersonation:** As described in `03-authentication.md`.
- **Course Creation:** Tutor → `/tutor/courses` → "New Course" → draft → 5‑step wizard (auto‑saves) → submit for review → admin approves/rejects.
- **Session Booking:** Student finds tutor → selects slot → `book_session()` RPC → creates session → notifications (if implemented).