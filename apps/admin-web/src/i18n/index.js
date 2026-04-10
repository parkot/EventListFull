import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './resources/en';
import es from './resources/es';
import el from './resources/el';

const LANGUAGE_STORAGE_KEY = 'admin-web-language';
const supportedLanguages = ['en', 'es', 'el'];

const getInitialLanguage = () => {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language?.split('-')[0];
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    el: { translation: el }
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

i18n.on('languageChanged', (language) => {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
});

export { LANGUAGE_STORAGE_KEY, supportedLanguages };
export default i18n;
