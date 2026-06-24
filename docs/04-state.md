# State Management

- **Zustand (`src/pathwise/store.ts`)**: Used **only** for the diagnostic quiz (answers, subject, goal, XP, streak). This is a lightweight global store.
- **React Query**: Not used – we rely on re‑fetching on mutation (e.g., after `saveDiagnosticResult`, call `getLatestDiagnostic` again).
- **Local Storage**: Used for:
  - `course-draft-{id}` – auto‑save drafts in course editor.
  - `pw-theme` – dark mode preference.
  - `impersonating` – admin impersonation flags.
  - `pathwise_diagnostic_id` / `pathwise_roadmap_id` – for claiming anonymous data after signup.