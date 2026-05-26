/** @type {import('i18next-parser').UserConfig} */
module.exports = {
  // Języki z i18n-config.ts
  locales: ['pl', 'en', 'de'],

  // Domyślny namespace
  defaultNamespace: 'common',

  // Istniejące namespace'y (public/locales/en/*.json)
  // common | dashboard | forms | marketing

  // Ścieżka wyjściowa  zgodna z public/locales/$LOCALE/$NAMESPACE.json
  output: 'public/locales/$LOCALE/$NAMESPACE.json',

  // Ścieżki wejściowe  projekt używa App Router bez katalogu src/
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    'actions/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
  ],

  // Klucze do tłumaczeń: t('key'), useTranslation, Trans
  namespaceSeparator: ':',
  keySeparator: '.',

  // Zachowaj istniejące klucze (nie nadpisuj)
  keepRemoved: false,

  // Dodaj brakujące klucze z wartością domyślną (klucz jako fallback)
  defaultValue: '__MISSING__',

  // Parsuj Trans components (react-i18next)
  reactNamespace: false,

  // Sortuj klucze alfabetycznie w plikach JSON
  sort: true,

  // Wcięcie w plikach JSON
  indentation: 2,

  // Nie resetuj przestarzałych kluczy (ostrzeżenie w logu)
  verbose: false,

  // Linia rozdzielająca w plikach JSON
  lineEnding: 'auto',

  // Zgodność z react-i18next  t('ns:key')
  i18nextOptions: {
    compatibilityJSON: 'v4',
  },
};