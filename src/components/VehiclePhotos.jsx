import React from 'react';
import { useTranslation } from 'react-i18next';

function VehiclePhotos({ vehicle, frontPhoto, setFrontPhoto, rearPhoto, setRearPhoto, rightPhoto, setRightPhoto, leftPhoto, setLeftPhoto, dashboardPhoto, setDashboardPhoto, handleImageClick, timeAgo, handleUpload }) {
  const { t } = useTranslation('vehicleRecordCard');

  const handleCheckPhotoDate = (photo) => {
    if (!photo) return false;

    const today = new Date().toISOString().split('T')[0];
    const photoDate = new Date(photo.lastModified).toISOString().split('T')[0];

    return photoDate === today;
  };

  return (
    <div className="col-span-1 md:col-span-2 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('Fotos del vehiculo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Photo upload sections */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('Vista Frontal')}</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  setFrontPhoto(file);
                  handleUpload(file, 'front', setFrontPhoto, 'front_image_url');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {vehicle?.front_image_url && (
              <>
                <img src={vehicle.front_image_url} alt={t('Frontal')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.front_image_url)} style={{ width: '130%', height: '130%' }} />
                {vehicle?.front_image_date && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(vehicle.front_image_date)}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('Vista trasera')}</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  setRearPhoto(file);
                  handleUpload(file, 'rear', setRearPhoto, 'rear_image_url');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {vehicle?.rear_image_url && (
              <>
                <img src={vehicle.rear_image_url} alt={t('Trasera')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.rear_image_url)} style={{ width: '130%', height: '130%' }} />
                {vehicle?.rear_image_date && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(vehicle.rear_image_date)}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('Vista Lateral Derecha')}</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  setRightPhoto(file);
                  handleUpload(file, 'right', setRightPhoto, 'right_image_url');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {vehicle?.right_image_url && (
              <>
                <img src={vehicle.right_image_url} alt={t('Derecha')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.right_image_url)} style={{ width: '130%', height: '130%' }} />
                {vehicle?.right_image_date && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(vehicle.right_image_date)}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('Vista Lateral Izquierda')}</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  setLeftPhoto(file);
                  handleUpload(file, 'left', setLeftPhoto, 'left_image_url');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {vehicle?.left_image_url && (
              <>
                <img src={vehicle.left_image_url} alt={t('Izquierda')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.left_image_url)} style={{ width: '130%', height: '130%' }} />
                {vehicle?.left_image_date && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(vehicle.left_image_date)}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t('Vista de Tablero')}</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  setDashboardPhoto(file);
                  handleUpload(file, 'dashboard', setDashboardPhoto, 'dashboard_image_url');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {vehicle?.dashboard_image_url && (
              <>
                <img src={vehicle.dashboard_image_url} alt={t('Tablero')} className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer" onClick={() => handleImageClick(vehicle.dashboard_image_url)} style={{ width: '130%', height: '130%' }} />
                {vehicle?.dashboard_image_date && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(vehicle.dashboard_image_date)}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehiclePhotos;
