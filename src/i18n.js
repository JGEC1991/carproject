import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "english": "English",
      "spanish": "Spanish",
      "loading": "Loading..."
    }
  },
  es: {
    translation: {
      "english": "Inglés",
      "spanish": "Español",
      "loading": "Cargando"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18next down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/configuration-options.html#initiation-options
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
