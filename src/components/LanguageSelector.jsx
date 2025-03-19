import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageSelector = () => {
  const { t } = useTranslation('translation');

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    console.log('Language changed to:', i18n.language);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-gray-100 text-gray-700 rounded-md py-2 px-4 focus:outline-none"
    >
      <option value="en">{t('english')}</option>
      <option value="es">{t('spanish')}</option>
    </select>
  );
};

export default LanguageSelector;
