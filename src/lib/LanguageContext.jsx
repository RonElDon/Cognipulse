import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { T, interpolate } from './i18n';

const LanguageContext = createContext({ lang: 'de', t: () => '', setLang: () => {}, loading: true });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('de');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        // UserProfile is auto-created for current user, just fetch directly
        setLangState('de');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setLang = async (newLang) => {
    setLangState(newLang);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.list();
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, { preferred_language: newLang });
      }
    } catch (e) {}
  };

  const t = (key, vars) => {
    const parts = key.split('.');
    let val = T[lang];
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) return key;
    }
    return vars ? interpolate(String(val), vars) : String(val);
  };

  // Don't render children until we know the correct language
  if (loading) return null;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}