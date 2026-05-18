'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import i18next, { getI18nConfig } from '@/lib/i18n';
import { supportedLanguages, defaultLanguage, Language } from '@/lib/i18n-config';

interface TranslationContextType {
  t: (key: string, defaultValueOrOptions?: string | Record<string, unknown>, options?: Record<string, unknown>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ 
  children,
  initialLanguage,
  resources
}: { 
  children: ReactNode;
  initialLanguage?: Language;
  resources?: Record<string, unknown>;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || defaultLanguage);
  
  // Initialize synchronously to avoid flickering
  if (typeof window !== 'undefined' && !i18next.isInitialized) {
    const config = getI18nConfig();
    if (resources) {
      config.resources = resources;
    }
    if (initialLanguage) {
      config.lng = initialLanguage;
    }
    i18next.init(config);
  } else if (typeof window !== 'undefined' && i18next.isInitialized && resources) {
    // If already initialized but new resources came in
    Object.keys(resources).forEach(lng => {
      Object.keys(resources[lng]).forEach(ns => {
        i18next.addResourceBundle(lng, ns, resources[lng][ns], true, true);
      });
    });
  }

  const [isReady, setIsReady] = useState(i18next.isInitialized);

  const setLanguage = useCallback(async (lang: Language) => {
    await i18next.changeLanguage(lang);
    setLanguageState(lang);
  }, []);

  // Initialize language and listen for changes
  useEffect(() => {
    const handleEvent = () => {
      setIsReady(true);
      if (i18next.language) {
        setLanguageState(i18next.language as Language);
      }
    };

    i18next.on('initialized', handleEvent);
    i18next.on('languageChanged', handleEvent);
    i18next.on('loaded', handleEvent);

    const initLanguage = async () => {
      const storedLang = typeof window !== 'undefined' ? localStorage.getItem('i18next') as Language | undefined : undefined;
      const preferredLang = initialLanguage || storedLang || defaultLanguage;

      if (supportedLanguages.includes(preferredLang as Language) && i18next.language !== preferredLang) {
        await i18next.changeLanguage(preferredLang as Language);
      }
      setIsReady(true);
    };

    initLanguage();

    return () => {
      i18next.off('initialized', handleEvent);
      i18next.off('languageChanged', handleEvent);
      i18next.off('loaded', handleEvent);
    };
  }, [initialLanguage]);

  // Stable t function - defined outside of useMemo for maximum stability
  const t = useCallback((key: string, defaultValueOrOptions?: string | Record<string, unknown>, options?: Record<string, unknown>) => {
    if (!i18next.isInitialized) {
      return typeof defaultValueOrOptions === 'string' ? defaultValueOrOptions : key;
    }
    
    if (typeof defaultValueOrOptions === 'string') {
      return i18next.t(key, defaultValueOrOptions, options);
    }
    
    return i18next.t(key, defaultValueOrOptions);
  }, []);

  const value = useMemo(() => ({
    t,
    language,
    setLanguage,
    availableLanguages: supportedLanguages
  }), [t, language, isReady, setLanguage]);

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
      t: (key: string, defaultValueOrOptions?: string | Record<string, unknown>) => 
        typeof defaultValueOrOptions === 'string' ? defaultValueOrOptions : key,
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
