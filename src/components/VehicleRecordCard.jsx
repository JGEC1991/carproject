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
          alert(`This photo appears to be from ${photoDate}, not today (${today}). Only photos from today can be uploaded.`);
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
              {isEditMode ? t('editVehicle') : t('vehicleDetails')}
            </h2>
            <p className="text-gray-600">
              {licensePlate ? `${t('licensePlate')}: ${licensePlate}` : t('addNewVehicle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('details')}
            >
              {t('details')}
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'photos' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('photos')}
            >
              {t('photos')}
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('make')}</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterMake')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('model')}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterModel')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('color')}</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterColor')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('year')}</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterYear')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('licensePlate')}</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterLicensePlate')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('vin')}</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterVIN')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('mileage')}</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('enterMileage')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('selectStatus')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('observations')}</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  placeholder={t('enterObservations')}
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('vehiclePhotos')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Photo upload sections */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('frontView')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setFrontPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.front_image_url && (
                      <img src={vehicle.front_image_url} alt={t('front')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.front_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('rearView')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setRearPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.rear_image_url && (
                      <img src={vehicle.rear_image_url} alt={t('rear')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.rear_image_url)} style={{ width: '130%', height: '130%' }} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('rightSide')}</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setRightPhoto(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {vehicle?.right_image_url && (
                      <img src={vehicle.right_image_url} alt={t('right')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-
