import { createInstance, InitOptions } from 'i18next';
import { useTranslation as useTranslationReact } from 'react-i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

import { supportedLanguages, defaultLanguage, Language } from './i18n-config';

export { supportedLanguages, defaultLanguage };
export type { Language };

const i18nConfig: InitOptions = {
  fallbackLng: defaultLanguage,
  supportedLngs: supportedLanguages,
  lng: defaultLanguage,
  debug: process.env.NODE_ENV !== 'production',
  interpolation: {
    escapeValue: false,
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  detection: {
    order: ['cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
    caches: ['cookie'],
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
    },
  },
  react: {
    useSuspense: false,
  },
};

const i18nInstance = createInstance();

if (typeof window !== 'undefined') {
  i18nInstance
    .use(HttpBackend)
    .use(initReactI18next)
    .init(i18nConfig);
}

export const useTranslation = useTranslationReact;
export default i18nInstance;
