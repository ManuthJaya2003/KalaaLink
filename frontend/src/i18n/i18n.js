import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './en.json';
import siTranslation from './si.json';
import taTranslation from './ta.json';
import esTranslation from './es.json';
import deTranslation from './de.json';
import frTranslation from './fr.json';

const resources = {
  en: {
    translation: enTranslation
  },
  si: {
    translation: siTranslation
  },
  ta: {
    translation: taTranslation
  },
  es: {
    translation: esTranslation
  },
  de: {
    translation: deTranslation
  },
  fr: {
    translation: frTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n;
