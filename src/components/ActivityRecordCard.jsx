import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function ActivityRecordCard({ activity, isEditMode = false, activeTab }) {
  const [date, setDate] = useState(activity?.date || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [activityType, setActivityType] = useState(activity?.activity_type || '');
  const [status, setStatus] = useState(activity?.status || '');
  const [amount, setAmount] = useState(activity?.amount || 0);
  const modalRef = useRef(null);
  const { t } = useTranslation('activityRecordCard');
  const [expandedImage, setExpandedImage] = useState(null);
  const [attachment, setAttachment] = useState(null); // State for new attachment
  const navigate = useNavigate();
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleSave = async () => {
    try {
      const attachmentUrl = await handleAttachmentUpload(attachment);

      const { data, error } = await supabase
        .from('activities')
        .update({
          date: date,
          description: description,
          activity_type: activityType,
          status: status,
          amount: amount,
          attachment_url: attachmentUrl,
        })
        .eq('id', activity.id)
        .select();

      if (error) {
        console.error('Error updating activity:', error);
        alert(error.message);
      } else {
        console.log('Activity updated:', data);
        alert('Activity updated successfully!');
        navigate(0); // Refresh the page
      }
    } catch (error) {
      console.error('Error updating activity:', error.message);
      alert(error.message);
    }
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const closeModal = () => {
    setExpandedImage(null);
  };

  const handleAttachmentUpload = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `activity-${activity.id}-${Date.now()}.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading attachment:', error);
        alert(t('errorUploadingAttachment', { ns: 'activityRecordCard' }) + error.message);
        return null;
      }

      const imageUrl = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)
        .data.publicUrl;

      return imageUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error.message);
      alert(error.message);
      return null;
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  

  const statusOptions = ["Completado", "Pendiente", "Vencido"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Error fetching user:', authError);
          return;
        }
        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          return;
        }

        setOrganizationId(userData?.organization_id);
        setUserId(userData?.id || null);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    const fetchActivityTypes = async () => {
      try {
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', authError);
          return;
        }
        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          return;
        }

        const organizationId = userData?.organization_id;

        const { data: customTypes, error: customTypesError } = await supabase
          .from('activity_types')
          .select('name')
          .eq('organization_id', organizationId);

        if (customTypesError) {
          console.error('Error fetching custom activity types:', customTypesError);
          return;
        }

        const { data: defaultTypes, error: defaultTypesError } = await supabase
          .from('activity_types')
          .select('name')
          .is('is_default', true);

        if (defaultTypesError) {
          console.error('Error fetching default activity types:', defaultTypesError);
          return;
        }

        // Extract names from custom types and merge with default types
        const customTypeNames = customTypes ? customTypes.map(type => type.name) : [];
        const defaultTypeNames = defaultTypes ? defaultTypes.map(type => type.name) : [];
        const allTypes = [...new Set([...defaultTypeNames, ...customTypeNames])].sort(); // Remove duplicates and sort

        setActivityTypeOptions(allTypes);
      } catch (error) {
        console.error('Error fetching activity types:', error);
        // If there's an error fetching custom types, still use the default types
        setActivityTypeOptions([]);
      }
    };

    fetchUserData();
    fetchActivityTypes();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? t('Editar Actividad', { ns: 'activityRecordCard' }) : t('Detalles de Actividad', { ns: 'activityRecordCard' })}
        </h2>
        <p className="text-gray-600">ID: {activity?.id}</p>
      </div>

      {activeTab === 'information' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Fecha', { ns: 'activityRecordCard' })}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('Ingresar fecha', { ns: 'activityRecordCard' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
              placeholder={t('Ingresar descripción', { ns: 'activityRecordCard' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Actividad</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seleccionar tipo de actividad</option>
              {activityTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seleccionar estado</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ingresar monto"
            />
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('Adjuntos', { ns: 'activityRecordCard' })}</h3>
          {activity?.attachment_url ? (
            <>
              <a href={activity.attachment_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={activity.attachment_url}
                  alt="Attachment"
                  className="rounded-lg w-40 h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(activity.attachment_url)}
                />
              </a>
              <label className="block text-sm font-medium text-gray-700 mt-4">Reemplazar archivo</label>
              <input
                type="file"
                accept="image/*, application/pdf"
                onChange={handleAttachmentChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </>
          ) : (
            <>
              <p>{t('No se econtraron adjuntos.', { ns: 'activityRecordCard' })}</p>
              <label className="block text-sm font-medium text-gray-700 mt-4">Subir archivo</label>
              <input
                type="file"
                accept="image/*, application/pdf"
                onChange={handleAttachmentChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
        >
          {t('Guardar', { ns: 'activityRecordCard' })}
        </button>
      </div>

      {expandedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={closeModal}>
          <div className="relative" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Expanded" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
            <button onClick={closeModal} className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRecordCard;
