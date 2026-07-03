import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);
const LANGUAGE_STORAGE_KEY = 'long_blog_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'vi') {
        return stored;
      }
    } catch {
      // Ignore storage access issues and use fallback default.
    }
    return 'en';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage write issues.
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      toggleLang: () => setLang((prev) => (prev === 'en' ? 'vi' : 'en')),
      t: (dictionary) => dictionary[lang] ?? dictionary.en
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
