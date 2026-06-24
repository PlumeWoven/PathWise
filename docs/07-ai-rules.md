# AI Assistant Rules

Follow these rules when generating or suggesting code for PathWise to keep outputs consistent and human‑like.

1. **Never use `any`** – use proper types (`TablesUpdate<"profiles">`, etc.).
2. **Always import API functions from `@/pathwise/api`** – never import `supabase` directly.
3. **Use existing UI components** (shadcn/ui) and `pw-*` CSS variables – avoid hardcoded hex.
4. **Zustand only for quiz state** – everything else uses React hooks.
5. **Error handling:** `toast.error()` for users, `console.error()` for debugging.
6. **Authentication:** use `useAuth()`, `RoleGate` for route protection.
7. **Dark mode:** always test both; use `var(--pw-*)` variables.
8. **File organisation:** routes in `src/routes/`, shared components in `src/components/`, domain logic in `src/pathwise/`.
9. **Documentation:** add JSDoc comments for new API functions; update this Bible when adding patterns.
10. **Course editor:** use the existing 5‑step wizard – do not rewrite.
11. **Admin features:** always check `user.app_metadata?.role === 'admin'`.
12. **Impersonation:** use the existing endpoint and localStorage flags.