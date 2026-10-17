import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface DarkModeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
  isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  // Unconditionally "light" so the first render is byte-identical on server and
  // client. Reading <html class="dark"> here instead — which the bootstrap script
  // in __root.tsx has already applied — is what caused the hydration mismatch:
  // the server has no DOM and always produced "light", so the trees diverged on
  // every load for anyone in dark mode. Page colours are unaffected, because CSS
  // keys off the <html> class rather than this state.
  const [theme, setThemeState] = useState<Theme>("light");

  // Writes the DOM and persists, then updates state.
  //
  // Deliberately not a `useEffect(..., [theme])`: such an effect also runs on
  // mount, where `theme` is still the SSR placeholder, and would strip the `dark`
  // class the bootstrap script set and overwrite `pw-theme` with "light" —
  // destroying the user's saved preference on every page load. Doing the work in
  // the setter means it only ever runs on a real theme change.
  //
  // The synchronous class flip also matters to ThemeToggle, which calls this
  // inside flushSync() inside document.startViewTransition() to drive the radial
  // sweep in styles.css.
  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("pw-theme", next);
    } catch {
      // localStorage may be unavailable (private mode) — ignore.
    }
    setThemeState(next);
  }, []);

  // Second pass: adopt whatever the bootstrap script already put on <html>.
  // State-only on purpose — the DOM is already correct, and writing localStorage
  // here would persist a preference the user never expressed.
  useEffect(() => {
    const applied = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState((current) => (current === applied ? current : applied));
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [applyTheme]);

  return (
    <DarkModeContext.Provider
      value={{ theme, toggleTheme, setTheme: applyTheme, isDark: theme === "dark" }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error("useDarkMode must be used within DarkModeProvider");
  return ctx;
}
