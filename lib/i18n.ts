import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { supportedLanguages, defaultLanguage, Language } from './i18n-config';

export { supportedLanguages, defaultLanguage };
export type { Language };

const isClient = typeof window !== 'undefined';

export const getI18nConfig = (): InitOptions => ({
  fallbackLng: defaultLanguage,
  supportedLngs: supportedLanguages,
  ns: ['common', 'dashboard', 'forms', 'marketing'],
  defaultNS: 'common',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  detection: isClient ? {
    order: ['cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
    caches: ['cookie'],
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
    },
  } : undefined,
});

if (isClient && !i18next.isInitialized) {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(getI18nConfig());
}

export default i18next;
