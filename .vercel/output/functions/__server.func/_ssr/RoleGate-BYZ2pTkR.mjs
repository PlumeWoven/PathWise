import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, P as PWHeader } from "./router-C4GolrgT.mjs";
function RoleGate({
  allow,
  allowAnonymous = false,
  children
}) {
  const { loading, isLoggedIn, role, openLogin } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!isLoggedIn && !allowAnonymous) openLogin();
  }, [loading, isLoggedIn, allowAnonymous, openLogin]);
  if (loading) return null;
  if (!isLoggedIn) return allowAnonymous ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children }) : null;
  if (role && !allow.includes(role)) {
    const isTutorOnly = role === "tutor";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 py-16 max-w-lg mx-auto text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: "🔒" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[28px] mt-3", children: [
          "This area is for ",
          allow.includes("student") ? "students" : "tutors"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] text-[var(--pw-ink-2)]", children: isTutorOnly ? "You're signed in as a tutor. Switch to a student account or update your role to use the learner experience." : "You're signed in as a student. Head to your roadmap to keep learning." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: isTutorOnly ? "/dashboard" : "/roadmap", className: "pw-btn-primary px-5 py-2.5 text-[14px]", children: isTutorOnly ? "Go to your tutor dashboard" : "Go to your roadmap" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({ to: "/" }), className: "pw-btn-outline px-5 py-2.5 text-[14px]", children: "Home" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  RoleGate as R
};
