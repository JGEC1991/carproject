import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';

function ActivityRecordCard({ activity }) {
  const [date, setDate] = useState(activity?.date || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [status, setStatus] = useState(activity?.status || '');
  const [activityType, setActivityType] = useState(activity?.activity_type || '');
  const { t } = useTranslation('activityRecordCard');

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          date: date,
          description: description,
          status: status,
          activity_type: activityType,
        })
        .eq('id', activity.id);

      if (error) {
        console.error('Error updating activity:', error);
        alert(error.message);
      } else {
        console.log('Activity updated:', data);
        alert('Activity updated successfully!');
      }
    } catch (error) {
      console.error('Error updating activity:', error.message);
      alert(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('activityDetails')}</h2>
        <p className="text-gray-600">Activity ID: {activity?.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('enterDate')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('enterDescription')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('enterStatus')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('activityType')}</label>
          <input
            type="text"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('enterActivityType')}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
        >
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
}

export default ActivityRecordCard;
