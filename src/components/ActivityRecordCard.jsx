import React, { useState, useRef } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useTranslation } from 'react-i18next';
    import { useNavigate } from 'react-router-dom';

    function ActivityRecordCard({ activity, isEditMode = false, activeTab }) {
      const [date, setDate] = useState(activity?.date || '');
      const [description, setDescription] = useState(activity?.description || '');
      const [activityType, setActivityType] = useState(activity?.activity_type || '');
      const [status, setStatus] = useState(activity?.status || '');
      const [amount, setAmount] = useState(activity?.amount || 0); // Add amount state
      const modalRef = useRef(null);
      const { t } = useTranslation('activityRecordCard');
      const [expandedImage, setExpandedImage] = useState(null);
      const navigate = useNavigate();

      const handleSave = async () => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .update({
              date: date,
              description: description,
              activity_type: activityType,
              status: status,
              amount: amount,
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

      const activityTypeOptions = [
        "Llanta averiada",
        "Mantenimiento",
        "Pago de tarifa",
        "Otro",
        "Lavado",
        "Vehiculo remolcado",
        "Actualizacion de millaje",
        "Inspeccion fisica",
        "Reparacion"
      ];

      const statusOptions = ["Completado", "Pendiente", "Vencido"];

      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Editar Actividad" : "Detalles de Actividad"}
            </h2>
            <p className="text-gray-600">Activity ID: {activity?.id}</p>
          </div>

          {activeTab === 'information' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar fecha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar descripción"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Actividad</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar tipo de actividad</option>
                  {activityTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar estado</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar monto"
                />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Adjuntos</h3>
              {activity?.attachment_url ? (
                <img
                  src={activity.attachment_url}
                  alt="Attachment"
                  className="rounded-lg w-40 h-40 object-cover cursor-pointer"
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
              Guardar Cambios
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
