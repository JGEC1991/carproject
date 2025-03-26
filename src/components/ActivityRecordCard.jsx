import React, { useState, useRef } from 'react';
    import { useTranslation } from 'react-i18next';

    function ActivityRecordCard({ activity, isEditMode = false, activeTab }) {
      const [date, setDate] = useState(activity?.date || '');
      const [description, setDescription] = useState(activity?.description || '');
      const [activityType, setActivityType] = useState(activity?.activity_type || '');
      const [status, setStatus] = useState(activity?.status || '');
      const modalRef = useRef(null);
      const { t } = useTranslation('activityRecordCard');
      const [expandedImage, setExpandedImage] = useState(null);

      const handleSave = async () => {
        // Implement save functionality here
        alert('Save functionality not implemented yet.');
      };

      const handleImageClick = (imageUrl) => {
        setExpandedImage(imageUrl);
      };

      const closeModal = () => {
        setExpandedImage(null);
      };

      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? t('editActivity') : t('activityDetails')}
            </h2>
            <p className="text-gray-600">Activity ID: {activity?.id}</p>
          </div>

          {activeTab === 'information' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterDate')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterDescription')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('activityType')}</label>
                <input
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterActivityType')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterStatus')}
                />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('attachments')}</h3>
              {activity?.attachment_url ? (
                <img
                  src={activity.attachment_url}
                  alt="Attachment"
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(activity.attachment_url)}
                />
              ) : (
                <p>No attachments available.</p>
              )}
            </div>
          )}

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
