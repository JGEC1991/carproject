import React from 'react';
import { useTranslation } from 'react-i18next';

const TestTranslation = () => {
  const { t } = useTranslation('translation');

  return (
    <div>
      <h1>{t('greeting')}</h1>
    </div>
  );
};

export default TestTranslation;
