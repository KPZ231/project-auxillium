'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import i18next from '@/lib/i18n';
import { supportedLanguages, defaultLanguage, Language } from '@/lib/i18n-config';

interface TranslationContextType {
  t: (key: string, options?: Record<string, any>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ 
  children,
  initialLanguage
}: { 
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || defaultLanguage);

  const setLanguage = useCallback(async (lang: Language) => {
    await i18next.changeLanguage(lang);
    setLanguageState(lang);
  }, []);

  // Initialize language
  useEffect(() => {
    const initLanguage = async () => {
      const storedLang = typeof window !== 'undefined' ? localStorage.getItem('i18next') as Language | undefined : undefined;
      const preferredLang = initialLanguage || storedLang || defaultLanguage;

      if (supportedLanguages.includes(preferredLang as any)) {
        await i18next.changeLanguage(preferredLang as Language);
        setLanguageState(preferredLang as Language);
      }
    };

    initLanguage();
  }, [initialLanguage]);

  // Stable t function - defined outside of useMemo for maximum stability
  const t = useCallback((key: string, options?: Record<string, any>) => {
    if (typeof i18next.t !== 'function') {
      return key;
    }
    return i18next.t(key, options);
  }, []);

  const value = useMemo(() => ({
    t,
    language,
    setLanguage,
    availableLanguages: supportedLanguages
  }), [t, language, setLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    return {
      t: (key: string) => key,
      language: defaultLanguage,
      setLanguage: async () => {},
      availableLanguages: supportedLanguages,
    };
  }
  return context;
}

// Helper to get cookie value on client side
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}
