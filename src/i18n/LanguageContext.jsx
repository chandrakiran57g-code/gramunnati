import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, getNestedTranslation, LANGUAGES } from './translations';

const STORAGE_KEY = 'cmsr_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'te' ? 'te' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'te' ? 'te' : 'en';
  }, [lang]);

  const setLang = useCallback((code) => {
    if (code === 'en' || code === 'te') setLangState(code);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'te' : 'en'));
  }, []);

  const t = useCallback(
    (key, fallback = '') => {
      const value = getNestedTranslation(translations[lang], key);
      return value ?? fallback ?? key;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, languages: LANGUAGES }),
    [lang, setLang, toggleLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
