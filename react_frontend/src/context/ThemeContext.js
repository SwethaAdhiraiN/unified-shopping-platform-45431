import React, { createContext, useContext, useState, useEffect } from 'react';

// PUBLIC_INTERFACE
export const ThemeContext = createContext();

/**
 * PUBLIC_INTERFACE
 * Provides theme (light/dark/auto) management using context.
 */
export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    const fromStorage = localStorage.getItem('theme');
    if (fromStorage === 'light' || fromStorage === 'dark') return fromStorage;
    // auto mode: choose based on prefers-color-scheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(curr => (curr === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useTheme() {
  return useContext(ThemeContext);
}
