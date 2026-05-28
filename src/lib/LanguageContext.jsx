import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { T, interpolate } from './i18n';

const LanguageContext = createContext({ lang: 'de', t: () => '', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('de');

  useEffect(() => {
    // Load language from user profile
    base44.auth.me()
      .then(user => base44.entities.UserProfile.filter({ created_by: user.email }))
      .then(profiles => {
        const l = profiles[0]?.preferred_language;
        if (l === 'en' || l === 'de') setLangState(l);
      })
      .catch(() => {});
  }, []);

  const setLang = async (newLang) => {
    setLangState(newLang);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, { preferred_language: newLang });
      }
    } catch (e) {}
  };

  /** t('train.title') or t('common.back') — supports dot-path */
  const t = (key, vars) => {
    const parts = key.split('.');
    let val = T[lang];
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) return key;
    }
    return vars ? interpolate(String(val), vars) : String(val);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}