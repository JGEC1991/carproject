import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabaseClient';

function VehiclePhotos({ vehicle, frontPhoto, setFrontPhoto, rearPhoto, setRearPhoto, rightPhoto, setRightPhoto, leftPhoto, setLeftPhoto, dashboardPhoto, setDashboardPhoto, timeAgo }) {
  const { t } = useTranslation('vehicleRecordCard');
  const [frontPhotoVersions, setFrontPhotoVersions] = useState([]);
  const [rearPhotoVersions, setRearPhotoVersions] = useState([]);
  const [rightPhotoVersions, setRightPhotoVersions] = useState([]);
  const [leftPhotoVersions, setLeftPhotoVersions] = useState([]);
  const [dashboardPhotoVersions, setDashboardPhotoVersions] = useState([]);

  const [frontPhotoIndex, setFrontPhotoIndex] = useState(0);
  const [rearPhotoIndex, setRearPhotoIndex] = useState(0);
  const [rightPhotoIndex, setRightPhotoIndex] = useState(0);
  const [leftPhotoIndex, setLeftPhotoIndex] = useState(0);
  const [dashboardPhotoIndex, setDashboardPhotoIndex] = useState(0);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);

  const fetchPhotoVersions = async (type) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_photos')
        .select('*')
        .eq('vehicle_id', vehicle?.id)
        .eq('photo_type', type)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error(`Error fetching ${type} photo versions:`, error);
        alert(error.message);
      } else {
        console.log(`Fetched ${type} photo versions:`, data);
        switch (type) {
          case 'front':
            setFrontPhotoVersions(data);
            break;
          case 'rear':
            setRearPhotoVersions(data);
            break;
          case 'right':
            setRightPhotoVersions(data);
            break;
          case 'left':
            setLeftPhotoVersions(data);
            break;
          case 'dashboard':
            setDashboardPhotoVersions(data);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} photo versions:`, error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (vehicle?.id) {
      fetchPhotoVersions('front');
      fetchPhotoVersions('rear');
      fetchPhotoVersions('right');
      fetchPhotoVersions('left');
      fetchPhotoVersions('dashboard');
    }
  }, [vehicle?.id]);

  const handleCheckPhotoDate = (photo) => {
    if (!photo) return false;

    const today = new Date().toISOString().split('T')[0];
    const photoDate = new Date(photo.lastModified).toISOString().split('T')[0];

    return photoDate === today;
  };

  const updateVehiclePhotoDate = async (vehicleId, column) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('vehicles')
        .update({ [column]: today })
        .eq('id', vehicleId);

      if (error) {
        console.error('Error updating vehicle photo date:', error);
        alert(error.message);
      } else {
        console.log('Vehicle photo date updated successfully:', data);
      }
    } catch (error) {
      console.error('Error updating vehicle photo date:', error.message);
      alert(error.message);
    }
  };

  const savePhotoVersion = async (file, type, imageUrl) => {
    try {
      // Fetch existing photo versions to determine the next version number
      const { data: existingVersions, error: fetchError } = await supabase
        .from('vehicle_photos')
        .select('*')
        .eq('vehicle_id', vehicle?.id)
        .eq('photo_type', type);

      if (fetchError) {
        console.error(`Error fetching existing ${type} photo versions:`, fetchError);
        alert(fetchError.message);
        return;
      }

      const versionNumber = existingVersions.length + 1;

      const { data, error } = await supabase
        .from('vehicle_photos')
        .insert([
          {
            vehicle_id: vehicle?.id,
            photo_type: type,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            version_number: versionNumber,
          },
        ]).select();

      if (error) {
        console.error(`Error saving ${type} photo version:`, error);
        alert(error.message);
      } else {
        console.log(`${type} photo version saved successfully:`, data);
        // After saving, refresh the photo versions
        fetchPhotoVersions(type);
      }
    } catch (error) {
      console.error(`Error saving ${type} photo version:`, error.message);
      alert(error.message);
    }
  };

  const handleUpload = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicle.id}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${vehicle.id}/${type}/${fileName}`; // Include subfolders

      const { data, error: uploadError } = await supabase.storage
        .from('jerentcars-storage') // Use the correct bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading image: ", uploadError);
        alert(uploadError.message);
        return null;
      }

      const imageUrl = `https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/jerentcars-storage/${filePath}`;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert(error.message);
      return null;
    }
  };

  const handlePhotoUpload = async (file, type, setPhoto, imageUrlColumn) => {
    try {
      setPhoto(file);
      const imageUrl = await handleUpload(file, type);
      if (imageUrl) {
        await savePhotoVersion(file, type, imageUrl);
        // Update the vehicle table with the new image URL
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .update({ [imageUrlColumn]: imageUrl })
          .eq('id', vehicle?.id)
          .select();

        if (vehicleError) {
          console.error(`Error updating vehicle record with ${type} image URL:`, vehicleError);
          alert(vehicleError.message);
        } else {
          console.log(`Vehicle record updated with ${type} image URL:`, vehicleData);
        }
      }
    } catch (error) {
      console.error(`Error handling ${type} photo upload:`, error.message);
      alert(error.message);
    }
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImageUrl(imageUrl);
  };

  const closeZoomedImage = () => {
    setZoomedImageUrl(null);
  };

  const showPreviousPhoto = (type) => {
    switch (type) {
      case 'front':
        setFrontPhotoIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'rear':
        setRearPhotoIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'right':
        setRightPhotoIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'left':
        setLeftPhotoIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'dashboard':
        setDashboardPhotoIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      default:
        break;
    }
  };

  const showNextPhoto = (type) => {
    switch (type) {
      case 'front':
        setFrontPhotoIndex(prevIndex => Math.min(prevIndex + 1, frontPhotoVersions.length - 1));
        break;
      case 'rear':
        setRearPhotoIndex(prevIndex => Math.min(prevIndex + 1, rearPhotoVersions.length - 1));
        break;
      case 'right':
        setRightPhotoIndex(prevIndex => Math.min(prevIndex + 1, rightPhotoVersions.length - 1));
        break;
      case 'left':
        setLeftPhotoIndex(prevIndex => Math.min(prevIndex + 1, leftPhotoVersions.length - 1));
        break;
      case 'dashboard':
        setDashboardPhotoIndex(prevIndex => Math.min(prevIndex + 1, dashboardPhotoVersions.length - 1));
        break;
      default:
        break;
    }
  };

  const PhotoNavigation = ({ type, versions, index, showPrevious, showNext }) => {
    if (!versions || versions.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center justify-between mt-2">
        <button onClick={() => showPrevious(type)} disabled={index === 0} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">
          Anterior
        </button>
        <span>{index + 1} / {versions.length}</span>
        <button onClick={() => showNext(type)} disabled={index === versions.length - 1} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">
          Siguiente
        </button>
      </div>
    );
  };

  const getCurrentImage = (type) => {
    switch (type) {
      case 'front':
        return frontPhotoVersions[frontPhotoIndex]?.image_url || vehicle?.front_image_url;
      case 'rear':
        return rearPhotoVersions[rearPhotoIndex]?.image_url || vehicle?.rear_image_url;
      case 'right':
        return rightPhotoVersions[rightPhotoIndex]?.image_url || vehicle?.right_image_url;
      case 'left':
        return leftPhotoVersions[leftPhotoIndex]?.image_url || vehicle?.left_image_url;
      case 'dashboard':
        return dashboardPhotoVersions[dashboardPhotoIndex]?.image_url || vehicle?.dashboard_image_url;
      default:
        return null;
    }
  };

  const getCurrentImageDate = (type) => {
    switch (type) {
      case 'front':
        return frontPhotoVersions[frontPhotoIndex]?.created_at || vehicle?.front_image_date;
      case 'rear':
        return rearPhotoVersions[rearPhotoIndex]?.created_at || vehicle?.rear_image_date;
      case 'right':
        return rightPhotoVersions[rightPhotoIndex]?.created_at || vehicle?.right_image_date;
      case 'left':
        return leftPhotoVersions[leftPhotoIndex]?.created_at || vehicle?.left_image_date;
      case 'dashboard':
        return dashboardPhotoVersions[dashboardPhotoIndex]?.created_at || vehicle?.dashboard_image_date;
      default:
        return null;
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('Fotos del vehiculo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Photo upload sections */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('Vista Frontal')}
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  handlePhotoUpload(file, 'front', setFrontPhoto, 'front_image_url');
                  updateVehiclePhotoDate(vehicle?.id, 'front_image_date');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {/* Display only one image */}
            {getCurrentImage('front') && (
              <>
                <img
                  src={getCurrentImage('front')}
                  alt={t('Frontal')}
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(getCurrentImage('front'))}
                  style={{ width: '130%', height: '130%' }}
                />
                {getCurrentImageDate('front') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(getCurrentImageDate('front'))}</p>
                )}
                {!getCurrentImageDate('front') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {t('No disponible')}</p>
                )}
              </>
            )}
            <PhotoNavigation
              type="front"
              versions={frontPhotoVersions}
              index={frontPhotoIndex}
              showPrevious={showPreviousPhoto}
              showNext={showNextPhoto}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('Vista trasera')}
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  handlePhotoUpload(file, 'rear', setRearPhoto, 'rear_image_url');
                  updateVehiclePhotoDate(vehicle?.id, 'rear_image_date');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {/* Display only one image */}
            {getCurrentImage('rear') && (
              <>
                <img
                  src={getCurrentImage('rear')}
                  alt={t('Trasera')}
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(getCurrentImage('rear'))}
                  style={{ width: '130%', height: '130%' }}
                />
                {getCurrentImageDate('rear') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(getCurrentImageDate('rear'))}</p>
                )}
                {!getCurrentImageDate('rear') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {t('No disponible')}</p>
                )}
              </>
            )}
            <PhotoNavigation
              type="rear"
              versions={rearPhotoVersions}
              index={rearPhotoIndex}
              showPrevious={showPreviousPhoto}
              showNext={showNextPhoto}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('Vista Lateral Derecha')}
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  handlePhotoUpload(file, 'right', setRightPhoto, 'right_image_url');
                  updateVehiclePhotoDate(vehicle?.id, 'right_image_date');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {/* Display only one image */}
            {getCurrentImage('right') && (
              <>
                <img
                  src={getCurrentImage('right')}
                  alt={t('Derecha')}
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(getCurrentImage('right'))}
                  style={{ width: '130%', height: '130%' }}
                />
                {getCurrentImageDate('right') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(getCurrentImageDate('right'))}</p>
                )}
                {!getCurrentImageDate('right') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {t('No disponible')}</p>
                )}
              </>
            )}
            <PhotoNavigation
              type="right"
              versions={rightPhotoVersions}
              index={rightPhotoIndex}
              showPrevious={showPreviousPhoto}
              showNext={showNextPhoto}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('Vista Lateral Izquierda')}
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  handlePhotoUpload(file, 'left', setLeftPhoto, 'left_image_url');
                  updateVehiclePhotoDate(vehicle?.id, 'left_image_date');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {/* Display only one image */}
            {getCurrentImage('left') && (
              <>
                <img
                  src={getCurrentImage('left')}
                  alt={t('Izquierda')}
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(getCurrentImage('left'))}
                  style={{ width: '130%', height: '130%' }}
                />
                {getCurrentImageDate('left') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(getCurrentImageDate('left'))}</p>
                )}
                {!getCurrentImageDate('left') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {t('No disponible')}</p>
                )}
              </>
            )}
            <PhotoNavigation
              type="left"
              versions={leftPhotoVersions}
              index={leftPhotoIndex}
              showPrevious={showPreviousPhoto}
              showNext={showNextPhoto}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('Vista de Tablero')}
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (handleCheckPhotoDate(file)) {
                  handlePhotoUpload(file, 'dashboard', setDashboardPhoto, 'dashboard_image_url');
                  updateVehiclePhotoDate(vehicle?.id, 'dashboard_image_date');
                } else {
                  alert('Solo se permiten fotos tomadas en la fecha actual.');
                  e.target.value = null; // Clear the input
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {/* Display only one image */}
            {getCurrentImage('dashboard') && (
              <>
                <img
                  src={getCurrentImage('dashboard')}
                  alt={t('Tablero')}
                  className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                  onClick={() => handleImageClick(getCurrentImage('dashboard'))}
                  style={{ width: '130%', height: '130%' }}
                />
                {getCurrentImageDate('dashboard') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {timeAgo(getCurrentImageDate('dashboard'))}</p>
                )}
                {!getCurrentImageDate('dashboard') && (
                  <p className="text-xs text-gray-500 mt-1">Subido: {t('No disponible')}</p>
                )}
              </>
            )}
            <PhotoNavigation
              type="dashboard"
              versions={dashboardPhotoVersions}
              index={dashboardPhotoIndex}
              showPrevious={showPreviousPhoto}
              showNext={showNextPhoto}
            />
          </div>
        </div>
      </div>
      {zoomedImageUrl && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={closeZoomedImage}>
          <div className="relative">
            <img src={zoomedImageUrl} alt="Zoomed" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
            <button onClick={closeZoomedImage} className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600">
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

export default VehiclePhotos;
