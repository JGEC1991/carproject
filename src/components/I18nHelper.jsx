import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';  // Direct import of the i18n instance

const I18nHelper = () => {
  const { t } = useTranslation('app');  // Only get t from useTranslation

  useEffect(() => {
    // Check for saved language in localStorage and apply it
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      console.log('Applied saved language:', savedLang);
    }
  }, []);

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    console.log('Language changed to:', lng);
    window.location.reload(); // Force full page reload to ensure all components update
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-md p-3 z-50">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">{t('selectLanguage')}:</label>
        <select 
          className="text-sm border rounded p-1"
          value={i18n.language || 'en'}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">{t('english')}</option>
          <option value="es">{t('spanish')}</option>
        </select>
      </div>
    </div>
  );
};

export default I18nHelper;
