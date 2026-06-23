import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface DarkModeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        if (t === 'dark') {
            root.classList.add('dark');
            // Force body background via inline style (overrides any CSS)
            document.body.style.backgroundColor = '#1F1F1E';
            document.body.style.color = '#F5F5F0';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#FAFAF7';
            document.body.style.color = '#1A1A1A';
        }
        localStorage.setItem('pw-theme', t);
    };

    useEffect(() => {
        const stored = localStorage.getItem('pw-theme') as Theme | null;
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored);
            applyTheme(stored);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = prefersDark ? 'dark' : 'light';
            setTheme(initial);
            applyTheme(initial);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <DarkModeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const ctx = useContext(DarkModeContext);
    if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider');
    return ctx;
}