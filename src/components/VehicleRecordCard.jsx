import React, { useState, useEffect, useRef } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useTranslation } from 'react-i18next';

    function VehicleRecordCard({ vehicle, isEditMode = false }) {
      const [activeTab, setActiveTab] = useState('details');
      const [make, setMake] = useState(vehicle?.make || '');
      const [model, setModel] = useState(vehicle?.model || '');
      const [color, setColor] = useState(vehicle?.color || '');
      const [year, setYear] = useState(vehicle?.year || '');
      const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate || '');
      const [vin, setVin] = useState(vehicle?.vin || '');
      const [mileage, setMileage] = useState(vehicle?.mileage || '');
      const [status, setStatus] = useState(vehicle?.status || '');
      const [observations, setObservations] = useState(vehicle?.observations || '');

      const [frontPhoto, setFrontPhoto] = useState(null);
      const [rearPhoto, setRearPhoto] = useState(null);
      const [rightPhoto, setRightPhoto] = useState(null);
      const [leftPhoto, setLeftPhoto] = useState(null);
      const [dashboardPhoto, setDashboardPhoto] = useState(null);

      // Modal state for image zoom
      const [zoomedImage, setZoomedImage] = useState(null);
      const modalRef = useRef(null);
      const { t } = useTranslation('vehicleRecordCard');

      const handleUpload = async (photo, folder, setPhotoState, fieldName) => {
        if (!photo) return;

        // Check if the photo was taken/modified today
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const photoDate = new Date(photo.lastModified).toISOString().split('T')[0];

        if (photoDate !== today) {
          alert(`Esta foto es de la fecha ${photoDate}, y no de la fecha corriente (${today}). Solamente las fotos de la fecha correinte seran admitidas.`);
          setPhotoState(null);
          return;
        }

        const { data, error } = await supabase.storage
          .from('vehicle-photos')
          .upload(`${vehicle.id}/${folder}/${photo.name}`, photo, {
            cacheControl: '3600',
            upsert: true,
            public: true,
            contentType: photo.type,
          });
        setPhotoState(null);
        if (error) alert(t('errorUploadingPhoto') + error.message);

        if(data){
            // Construct the full public URL for the uploaded image
            const fullUrl = `https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/vehicle-photos/${data.path}`;

            const {data: updateData, error: updateError} = await supabase
                .from('vehicles')
                .update({[fieldName]: fullUrl})
                .eq('id', vehicle.id)

            if(updateError){
                alert('Error updating vehicle photo URL: ' + updateError.message)
            }
        }
      };

      const handleSave = async () => {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({
            make,
            model,
            color,
            year,
            license_plate: licensePlate,
            vin,
            mileage,
            status,
            observations,
          })
          .eq('id', vehicle.id);
        if (updateError) {
          alert('Error updating vehicle details: ' + updateError.message);
          return;
        }
        if (frontPhoto) await handleUpload(frontPhoto, 'front', setFrontPhoto, 'front_image_url');
        if (rearPhoto) await handleUpload(rearPhoto, 'rear', setRearPhoto, 'rear_image_url');
        if (rightPhoto) await handleUpload(rightPhoto, 'right', setRightPhoto, 'right_image_url');
        if (leftPhoto) await handleUpload(leftPhoto, 'left', setLeftPhoto, 'left_image_url');
        if (dashboardPhoto) await handleUpload(dashboardPhoto, 'dashboard', setDashboardPhoto, 'dashboard_image_url');
        alert(t('vehicleRecordUpdatedSuccessfully'));
      };

      // Handle image click to zoom
      const handleImageClick = (imageUrl) => {
        setZoomedImage(imageUrl);
      };

      // Close the zoom modal
      const closeModal = () => {
        setZoomedImage(null);
      };


      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? t('Editar vehiculo') : t('Detalles de vehiculo')}
            </h2>
            <p className="text-gray-600">
              {licensePlate ? `${t('Matricula')}: ${licensePlate}` : t('Agregar vehiculo')}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('details')}
            >
              {t('Detalles')}
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'photos' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('photos')}
            >
              {t('Fotos')}
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Marca')}</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar marca')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Modelo')}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar un modelo')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Color')}</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar un color')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Año')}</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar año')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Matricula')}</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar una matricula')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Vin')}</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar un vin')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Millaje')}</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar millaje')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Estado')}</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Seleccionar un estado')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Observaciones')}</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  placeholder={t('Agregar observaciones')}
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('Fotos de vehiculo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Photo upload sections */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Vista Frontal')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setFrontPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.front_image_url && (
                      <img src={vehicle.front_image_url} alt={t('Frontal')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.front_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Vista Trasera')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setRearPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.rear_image_url && (
                      <img src={vehicle.rear_image_url} alt={t('Trasera')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.rear_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Vista Lateral Derecha')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setRightPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.right_image_url && (
                      <img src={vehicle.right_image_url} alt={t('Derecha')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.right_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Vista Lateral Izquierda')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setLeftPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.left_image_url && (
                      <img src={vehicle.left_image_url} alt={t('Izquierda')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.left_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('Vista de Tablero')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setDashboardPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.dashboard_image_url && (
                      <img src={vehicle.dashboard_image_url} alt={t('Tablero')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.dashboard_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
            >
              {t('Guardar')}
            </button>
          </div>

          {/* Image Zoom Modal */}
          {zoomedImage && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50" onClick={closeModal}>
              <div className="relative" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <img src={zoomedImage} alt="Zoomed" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
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

    export default VehicleRecordCard
