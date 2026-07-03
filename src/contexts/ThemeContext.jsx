import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const themes = {
  dark: {
    name: 'dark',
    background: '#0B1120',
    heroTitle: '#F4F7FC',
    secondary: '#A8B3CF',
    glowCharacter: '#012D89',
    glowWarm: '#D1A388',
    text: '#F4F7FC',
    marquee: 'rgba(168, 179, 207, 0.15)'
  },
  light: {
    name: 'light',
    background: '#F8FAFD',
    heroTitle: '#14213D',
    secondary: '#52627F',
    glowCharacter: '#7BC7FF',
    glowWarm: '#D1A388',
    text: '#14213D',
    marquee: 'rgba(82, 98, 127, 0.12)'
  }
};

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'long_blog_theme';

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // Ignore storage access issues and use fallback default.
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch {
      // Ignore storage write issues.
    }
  }, [themeName]);

  const value = useMemo(() => {
    const toggleTheme = () => {
      setThemeName((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return {
      themeName,
      theme: themes[themeName],
      toggleTheme
    };
  }, [themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
