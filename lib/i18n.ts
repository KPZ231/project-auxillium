import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

import { supportedLanguages, defaultLanguage, Language } from './i18n-config';

export { supportedLanguages, defaultLanguage };
export type { Language };

const isClient = typeof window !== 'undefined';

const config: InitOptions = {
  fallbackLng: defaultLanguage,
  supportedLngs: supportedLanguages,
  lng: defaultLanguage,
  debug: process.env.NODE_ENV !== 'production',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};

if (isClient) {
  config.backend = {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  };
  config.detection = {
    order: ['cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
    caches: ['cookie'],
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
    },
  };
  config.use = [HttpBackend, LanguageDetector, initReactI18next];
} else {
  // Server-side initialization
  if (process.env.NEXT_RUNTIME !== 'edge') {
    config.backend = {
      loadPath: `${process.cwd()}/public/locales/{{lng}}/{{ns}}.json`,
    };
  }
  config.use = [initReactI18next];
}

if (!i18next.isInitialized) {
  i18next.init(config);
}

export default i18next;
