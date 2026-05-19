import { createInstance } from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { supportedLanguages, defaultLanguage, Language } from './i18n-config';

export { supportedLanguages, defaultLanguage };
export type { Language };

export async function initI18n() {
  const i18nInstance = createInstance();

  await i18nInstance
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
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
    });

  return i18nInstance;
}

// Load resources from JSON files (for server-side rendering)
export async function loadResources(language: Language): Promise<any> {
  try {
    const response = await fetch(`http://localhost:3000/locales/${language}/common.json`);
    if (response.ok) {
      const data = await response.json();
      return {
        common: data,
      };
    }
  } catch (error) {
    console.error(`Failed to load resources for language: ${language}`, error);
  }
  return {};
}
