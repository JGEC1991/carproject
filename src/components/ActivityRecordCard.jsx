import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const activityTypes = [
  "Llanta averiada",
  "Afinamiento",
  "Pago de tarifa",
  "Otro",
  "Lavado de vehiculo",
  "Vehiculo remolcado",
  "Actualizacion de millaje",
  "Inspeccion fisica",
  "Reparacion",
  "Cambio de aceite",
  "Calibracion de llantas",
  "Cambio o relleno de coolant",
  "Cambio de frenos"
].sort();

function ActivityRecordCard({ activity, isEditMode = false, activeTab, customActivityTypes = [] }) {
  const [date, setDate] = useState(activity?.date || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [activityType, setActivityType] = useState(activity?.activity_type || '');
  const [status, setStatus] = useState(activity?.status || '');
  const [amount, setAmount] = useState(activity?.amount || 0);
  const modalRef = useRef(null);
  const { t } = useTranslation('activityRecordCard');
  const [expandedImage, setExpandedImage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [requirePhotoDateFilter, setRequirePhotoDateFilter] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Error fetching user:', authError);
          return;
        }

        const userId = authUser.user.id;

        const { data: userData, error: userRoleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (userRoleError) {
          console.error('Error fetching user role:', userRoleError);
          return;
        }

        setUserRole(userData?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error.message);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchActivityType = async () => {
      try {
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', userError);
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

        console.log('activityType:', activityType); // Log activityType
        console.log('organizationId:', organizationId); // Log organizationId

        const { data: activityTypeData, error: activityTypeError } = await supabase
          .from('activity_types')
          .select('require_photo_date_filter')
          .eq('name', activityType)
          .eq('organization_id', organizationId)
          .single();

        if (activityTypeError) {
          console.error('Error fetching activity type:', activityTypeError);
          return;
        }

        console.log('Activity Type Data from Supabase:', activityTypeData); // Log the data from Supabase
        setRequirePhotoDateFilter(activityTypeData?.require_photo_date_filter || false);
      } catch (error) {
        console.error('Error fetching activity type:', error);
      }
    };

    if (activityType) {
      fetchActivityType();
    }
  }, [activityType]);

  const handleCheckPhotoDate = (file) => {
    if (!file) return false;

    const today = new Date().toISOString().split('T')[0];

    // Use lastModified date
    const photoDate = new Date(file.lastModified).toISOString().split('T')[0];

    console.log('requirePhotoDateFilter:', requirePhotoDateFilter); // Log the comparison result
    return photoDate === today;
  };

  const handleSave = async () => {
    try {
      let attachmentUrl = activity?.attachment_url;

      if (attachment) {
        if (requirePhotoDateFilter) {
          if (!handleCheckPhotoDate(attachment)) {
            alert('Solo se permiten fotos tomadas en la fecha actual.');
            return;
          }
        }

        attachmentUrl = await handleFileUpload(attachment);
        if (!attachmentUrl) {
          alert('Failed to upload attachment. Please try again.');
          return;
        }
      }

      const updates = {
        date: date,
        description: description,
        activity_type: activityType,
        amount: amount,
      };

      // Conditionally update status based on user role and activity type
      if (activityType !== 'Pago de tarifa' || userRole === 'admin') {
        updates.status = status;
      }

      const { data, error } = await supabase
        .from('activities')
        .update(updates)
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

  const handleFileUpload = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-attachment.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading attachment:', error);
        alert(error.message);
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

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const closeModal = () => {
    setExpandedImage(null);
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    if (requirePhotoDateFilter) {
      if (!handleCheckPhotoDate(file)) {
        alert('Solo se permiten fotos tomadas en la fecha actual.');
        e.target.value = null;
        return;
      }
    }
    setAttachment(file);
  };

  const statusOptions = ["Completado", "Pendiente", "Vencido"];

  // Merge and sort activity types
  const allActivityTypes = [...new Set([...activityTypes, ...customActivityTypes])].sort();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? (t('Editar Actividad', { ns: 'activityRecordCard' })) : (t('Detalles de Actividad', { ns: 'activityRecordCard' }))}
        </h2>
        <p className="text-gray-600">
          ID: {activity?.id}
        </p>
      </div>

      {activeTab === 'information' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Fecha', { ns: 'activityRecordCard' })}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('Ingresar fecha', { ns: 'activityRecordCard' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              placeholder={t('Ingresar descripción', { ns: 'activityRecordCard' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Actividad</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccionar tipo de actividad</option>
              {allActivityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={activityType === 'Pago de tarifa' && userRole !== 'admin'}
            >
              <option value="">Seleccionar estado</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresar monto"
            />
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{t('Adjuntos', { ns: 'activityRecordCard' })}</h3>
          {activity?.attachment_url ? (
            <div className="mb-4">
              <img
                src={activity.attachment_url}
                alt="Attachment"
                className="rounded-lg w-40 h-40 object-cover cursor-pointer"
                onClick={() => handleImageClick(activity.attachment_url)}
              />
            </div>
          ) : (
            <p className="text-gray-500">{t('No se econtraron adjuntos.', { ns: 'activityRecordCard' })}</p>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-2">Subir archivo</label>
          <input
            type="file"
            accept="image/*, application/pdf"
            onChange={handleAttachmentChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
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
