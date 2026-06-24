import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface DarkModeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
  isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

// Read the theme the inline bootstrap script in __root.tsx has already
// applied to <html>. Falls back to 'light' on the server (where there is no
// DOM) so SSR output is deterministic — the bootstrap script reconciles
// before hydration runs.
function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // Keep <html> in sync with state and persist the user's choice. We only
  // toggle the class — colors come from styles.css so we don't fight CSS
  // with inline element styles.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("pw-theme", theme);
    } catch {
      // localStorage may be unavailable (private mode, SSR fallback) — ignore.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const setThemeValue = (next: Theme) => {
    setTheme(next);
  };

  return (
    <DarkModeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeValue, isDark: theme === "dark" }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error("useDarkMode must be used within DarkModeProvider");
  return ctx;
}
