import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VehicleCoreInfo from './VehicleCoreInfo';
import VehiclePhotos from './VehiclePhotos';
import VehicleMaintenanceHistory from './VehicleMaintenanceHistory';
import VehicleRepairHistory from './VehicleRepairHistory';
import VehicleFinances from './VehicleFinances';
import useVehicleData from '../hooks/useVehicleData';
import { supabase } from '../supabaseClient';

function VehicleRecordCard({ vehicleId, isEditMode = false, userRole }) {
  const { vehicle, loading, error } = useVehicleData(vehicleId);
  const [activeTab, setActiveTab] = useState('details');
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [rearPhoto, setRearPhoto] = useState(null);
  const [rightPhoto, setRightPhoto] = useState(null);
  const [leftPhoto, setLeftPhoto] = useState(null);
  const [dashboardPhoto, setDashboardPhoto] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [reparaciones, setReparaciones] = useState([]);
  const [finanzas, setFinanzas] = useState({
    totalRevenue: 0,
    totalOverdueRevenue: 0,
    totalExpenses: 0,
  });
  const modalRef = useRef(null);
  const { t } = useTranslation('vehicleRecordCard');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [gps, setGps] = useState(false);
  const [carOwnership, setCarOwnership] = useState('Propio');
  const [carPaymentDay, setCarPaymentDay] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [financesTimeRange, setFinancesTimeRange] = useState('all');

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [status, setStatus] = useState('');
  const [observations, setObservations] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmissionType, setTransmissionType] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [registrationExpiryDate, setRegistrationExpiryDate] = useState('');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make || '');
      setModel(vehicle.model || '');
      setColor(vehicle.color || '');
      setYear(vehicle.year || '');
      setLicensePlate(vehicle.license_plate || '');
      setVin(vehicle.vin || '');
      setMileage(vehicle.mileage || '');
      setStatus(vehicle.status || '');
      setObservations(vehicle.observations || '');
      setGps(vehicle.gps || false);
      setCarOwnership(vehicle.car_ownership || 'Propio');
      setCarPaymentDay(vehicle.car_payment_day || '');
      setDeposit(vehicle.deposit || 0);
      setVehicleType(vehicle.vehicle_type || '');
      setFuelType(vehicle.fuel_type || '');
      setTransmissionType(vehicle.transmission_type || '');
      setInsuranceProvider(vehicle.insurance_provider || '');
      setInsurancePolicyNumber(vehicle.insurance_policy_number || '');
      setRegistrationExpiryDate(vehicle.registration_expiry_date || '');
    }
  }, [vehicle]);

  const handleImageClick = (imageUrl) =>
    setZoomedImage(imageUrl);

  // Close the zoom modal
  const closeModal = () => {
    setZoomedImage(null);
  };

  const handleSave = async () => {
    try {
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
          gps: gps,
          car_ownership: carOwnership,
          car_payment_day: carOwnership === 'Propio' ? null : carPaymentDay,
          deposit: deposit,
          vehicle_type: vehicleType,
          fuel_type: fuelType,
          transmission_type: transmissionType,
          insurance_provider: insuranceProvider,
          insurance_policy_number: insurancePolicyNumber,
          registration_expiry_date: registrationExpiryDate,
        })
        .eq('id', vehicleId);
      if (updateError) {
        alert('Error updating vehicle details: ' + updateError.message);
        return;
      }
      alert('Vehicle details updated successfully!');
    } catch (error) {
      console.error('Error updating vehicle details:', error.message);
      alert(error.message);
    }
  };

  const handleUpload = async (photo, folder, setPhotoState, fieldName) => {
    if (!photo) return;

    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${vehicleId}-${fieldName}-${Date.now()}.${fileExt}`; // Ensure unique file name
      const filePath = `vehicles/${vehicle?.make}-${vehicle?.model}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: false, // Do not overwrite existing files
          public: true,
          contentType: photo.type,
        });
      setPhotoState(null);
      if (error) {
        alert(t('errorUploadingPhoto') + error.message);
        return;
      }

      // Construct the full public URL for the uploaded image
      const fullUrl = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)
        .data.publicUrl;

      const { data: updateData, error: updateError } = await supabase
        .from('vehicles')
        .update({ [fieldName]: fullUrl })
        .eq('id', vehicleId);

      if (updateError) {
        alert('Error updating vehicle photo URL: ' + updateError.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error.message);
      alert(error.message);
    }
  };

  const renderTabButtons = () => {
    const tabButtons = [
      { key: 'details', label: t('Informacion') },
      { key: 'photos', label: t('Fotos') },
    ];
  
    if (userRole === 'admin') {
      tabButtons.push(
        { key: 'historial', label: 'Mantenimientos' },
        { key: 'reparaciones', label: 'Reparaciones' },
        { key: 'finanzas', label: 'Finanzas' }
      );
    }
  
    return tabButtons.map((tab) => (
      <button
        key={tab.key}
        className={`px-4 py-2 rounded-t-lg ${activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        onClick={() => setActiveTab(tab.key)}
      >
        {tab.label}
      </button>
    ));
  };

  const timeAgo = (date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Ayer';
    } else {
      return `Hace ${days} días`;
    }
  };

  useEffect(() => {
    const fetchActivityHistory = async () => {
      const activityTypesToFetch = [
        "Afinamiento",
        "Calibracion de llantas",
        "Cambio de aceite",
        "Cambio o relleno de coolant",
        "Inspeccion fisica",
        "Lavado de vehiculo"
      ];
      const historyData = [];
      for (const activityType of activityTypesToFetch) {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('date')
            .eq('vehicle_id', vehicleId)
            .eq('activity_type', activityType)
            .order('date', { ascending: false })
            .limit(1);

          if (error) {
            console.error(`Error fetching ${activityType} history:`, error);
          } else {
            if (data && data.length > 0) {
              historyData.push({ activity_type: activityType, date: data[0].date });
            }
          }
        } catch (error) {
          console.error(`Error fetching ${activityType} history:`, error);
        }
      }
      historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivityHistory(historyData);
    };

     const fetchReparaciones = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('date, activity_type, description, amount')
          .eq('vehicle_id', vehicleId)
          .eq('activity_type', 'Reparacion')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching reparaciones:', error);
        } else {
          setReparaciones(data);
        }
      } catch (error) {
        console.error('Error fetching reparaciones:', error);
      }
    };

    const fetchFinancialData = async () => {
      try {
        let startDate;
        const today = new Date();

        switch (financesTimeRange) {
          case 'currentMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          default:
            startDate = null;
        }

        let query = supabase
          .from('activities')
          .select('activity_type, amount, status, date')
          .eq('vehicle_id', vehicleId);

        if (startDate) {
          query = query.gte('date', startDate.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching activities:', error);
          return;
        }

        setActivities(data);

        let totalRevenue = 0;
        let totalOverdueRevenue = 0;
        let totalExpenses = 0;

        data.forEach(activity => {
          if (activity.activity_type === 'Pago de tarifa') {
            if (activity.status === 'Completado') {
              totalRevenue += activity.amount || 0;
            } else if (activity.status === 'Vencido') {
              totalOverdueRevenue += activity.amount || 0;
            }
          } else if (activity.status === 'Completado') {
            totalExpenses += activity.amount || 0;
          }
        });

        setFinanzas({
          totalRevenue,
          totalOverdueRevenue,
          totalExpenses,
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    if (vehicleId) {
      fetchActivityHistory();
      fetchReparaciones();
      fetchFinancialData();
    }
  }, [vehicleId, financesTimeRange]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? t('Editar vehiculo') : t('')}
        </h2>
        <p className="text-gray-600">
          {vehicle?.license_plate ? `${t('Matricula')}: ${vehicle.license_plate}` : t('Agregar un vehiculo')}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        {renderTabButtons()}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <VehicleCoreInfo
          vehicle={vehicle}
          isEditMode={isEditMode}
          make={make}
          model={model}
          color={color}
          year={year}
          licensePlate={licensePlate}
          vin={vin}
          mileage={mileage}
          status={status}
          observations={observations}
          vehicleType={vehicleType}
          fuelType={fuelType}
          transmissionType={transmissionType}
          insuranceProvider={insuranceProvider}
          insurancePolicyNumber={insurancePolicyNumber}
          registrationExpiryDate={registrationExpiryDate}
          setMake={setMake}
          setModel={setModel}
          setColor={setColor}
          setYear={setYear}
          setLicensePlate={setLicensePlate}
          setVin={setVin}
          setMileage={setMileage}
          setStatus={setStatus}
          setObservations={setObservations}
          setVehicleType={setVehicleType}
          setFuelType={setFuelType}
          setTransmissionType={setTransmissionType}
          setInsuranceProvider={setInsuranceProvider}
          setInsurancePolicyNumber={setInsurancePolicyNumber}
          setRegistrationExpiryDate={setRegistrationExpiryDate}
        />
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <VehiclePhotos
          vehicle={vehicle}
          frontPhoto={frontPhoto}
          setFrontPhoto={setFrontPhoto}
          rearPhoto={rearPhoto}
          setRearPhoto={setRearPhoto}
          rightPhoto={rightPhoto}
          setRightPhoto={setRightPhoto}
          leftPhoto={leftPhoto}
          setLeftPhoto={setLeftPhoto}
          dashboardPhoto={dashboardPhoto}
          setDashboardPhoto={setDashboardPhoto}
          handleImageClick={handleImageClick}
          timeAgo={timeAgo}
          handleUpload={handleUpload}
        />
      )}

      {/* Historial Tab */}
      {activeTab === 'historial' && userRole === 'admin' && (
        <VehicleMaintenanceHistory
          activityHistory={activityHistory}
          timeAgo={timeAgo}
        />
      )}

      {/* Reparaciones Tab */}
      {activeTab === 'reparaciones' && userRole === 'admin' && (
        <VehicleRepairHistory
          reparaciones={reparaciones}
          timeAgo={timeAgo}
        />
      )}

      {/* Finanzas Tab */}
      {activeTab === 'finanzas' && userRole === 'admin' && (
        <VehicleFinances
          finanzas={finanzas}
          gps={gps}
          carOwnership={carOwnership}
          carPaymentDay={carPaymentDay}
          deposit={deposit}
          setGps={setGps}
          setCarOwnership={setCarOwnership}
          setCarPaymentDay={setCarPaymentDay}
          setDeposit={setDeposit}
          financesTimeRange={financesTimeRange}
          setFinancesTimeRange={setFinancesTimeRange}
          activities={activities}
        />
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
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={closeModal}>
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

export default VehicleRecordCard;
