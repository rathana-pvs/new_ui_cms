import React, { createContext, useContext, useEffect, useState } from 'react';
import { theme } from '../styles/theme';

const ThemeProviderContext = createContext({});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'cubrid-ui-theme',
  ...props
}) {
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(themeMode);
  }, [themeMode]);

  // Inject CSS Variables into the root based on theme.js
  useEffect(() => {
    const root = window.document.documentElement;
    // We handle the dynamic classes via Tailwind rather than direct var injection unless specifically needed
    // The design doc specifies that theme.js is mostly a constant import.
  }, []);

  const value = {
    themeMode,
    setTheme: (mode) => {
      localStorage.setItem(storageKey, mode);
      setThemeMode(mode);
    },
    tokens: theme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
