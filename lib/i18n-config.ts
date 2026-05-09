export const supportedLanguages = ['pl', 'en', 'de'] as const;
export type Language = typeof supportedLanguages[number];

export const defaultLanguage: Language = 'pl';
