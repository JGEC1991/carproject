import React, { useState } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useTranslation } from 'react-i18next';

    function ActivityRecordCard({ activity, activeTab, isEditMode = false }) {
      const [date, setDate] = useState(activity?.date || '');
      const [description, setDescription] = useState(activity?.description || '');
      const [status, setStatus] = useState(activity?.status || 'Pendiente');
      const [activityType, setActivityType] = useState(activity?.activity_type || '');
      const [attachment, setAttachment] = useState(null);
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

      const handleUpload = async (file) => {
        try {
          if (!file) return;

          const { data, error } = await supabase.storage
            .from('jerentcars-storage')
            .upload(`activities/${activity.id}/attachments/${file.name}`, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Error uploading file:', error);
            alert(error.message);
            return;
          }

          const imageUrl = supabase.storage
            .from('jerentcars-storage')
            .getPublicUrl(data.path)
            .data.publicUrl;

          const { error: updateError } = await supabase
            .from('activities')
            .update({ attachment_url: imageUrl })
            .eq('id', activity.id);

          if (updateError) {
            console.error('Error updating activity with URL:', updateError);
            alert(updateError.message);
          } else {
            alert('File uploaded successfully!');
            window.location.reload();
          }
        } catch (error) {
          console.error('Error:', error);
          alert(error.message);
        }
      };

      const statusOptions = ['Pendiente', 'Completado'];
      const activityTypeOptions = ['Carwash', 'Check engine', 'Flat tire', 'Maintenance', 'Other', 'Physical inspection', 'Suspension', 'Tow'];

      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? t('editActivity') : t('activityDetails')}
            </h2>
            <p className="text-gray-600">
              Activity ID: {activity?.id}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input
                type="date"
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
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('activityType')}</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {activityTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'files' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              {activity?.attachment_url ? (
                <a href={activity.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                  View Attachment
                </a>
              ) : (
                <>
                  <input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="*"
                  />
                  <button
                    onClick={() => handleUpload(attachment)}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
                  >
                    Upload File
                  </button>
                </>
              )}
            </div>
          )}

          {isEditMode && activeTab === 'information' && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
              >
                {t('saveChanges')}
              </button>
            </div>
          )}
        </div>
      );
    }

    export default ActivityRecordCard;
