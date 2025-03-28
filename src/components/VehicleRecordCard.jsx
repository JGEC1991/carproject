
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from 'react-i18next';

function VehicleRecordCard({ vehicle, isEditMode = false, userRole }) {
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

  const [gps, setGps] = useState(vehicle?.gps || false);
  const [carOwnership, setCarOwnership] = useState(vehicle?.car_ownership || 'Propio');
  const [carPaymentDay, setCarPaymentDay] = useState(vehicle?.car_payment_day || '');
  const [deposit, setDeposit] = useState(vehicle?.deposit || 0);
  const [financesTimeRange, setFinancesTimeRange] = useState('all');

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

  const statusOptions = ["Completado", "Pendiente", "Vencido", "Cancelado"];

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
            .eq('vehicle_id', vehicle.id)
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
          .eq('vehicle_id', vehicle.id)
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
          case 'lastWeek':
            startDate = new Date(today.setDate(today.getDate() - 14));
            break;
          case 'currentWeek':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
          case 'lastMonth':
            startDate = new Date(today.setMonth(today.getMonth() - 2));
            break;
          case 'currentMonth':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
          default:
            startDate = null;
        }

        let query = supabase
          .from('activities')
          .select('activity_type, amount, status, date')
          .eq('vehicle_id', vehicle.id);

        if (startDate) {
          query = query.gte('date', startDate.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching activities:', error);
          return;
        }

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

    if (vehicle?.id) {
      fetchActivityHistory();
      fetchReparaciones();
      fetchFinancialData();
    }
  }, [vehicle?.id, financesTimeRange]);

      const handleUpload = async (photo, folder, setPhotoState, fieldName) => {
        if (!photo) return;

        // Check if the photo was taken/modified today
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const photoDate = new Date(photo.lastModified).toISOString().split('T')[0];

        if (photoDate !== today) {
          alert(`Esta foto es de el ${photoDate}, y no de hoy (${today}). Solo fotos de la fecha corriente seran admitidas.`);
          setPhotoState(null);
          return;
        }

        try {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${vehicle.id}-${fieldName}-${Date.now()}.${fileExt}`; // Ensure unique file name
          const filePath = `vehicles/${vehicle.make}-${vehicle.model}/${folder}/${fileName}`;

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
            .update({ [fieldName]: fullUrl, [`${fieldName.replace('_url', '_date')}`]: new Date().toISOString() })
            .eq('id', vehicle.id);

          if (updateError) {
            alert('Error updating vehicle photo URL: ' + updateError.message);
          }
        } catch (error) {
          console.error('Error uploading image:', error.message);
          alert(error.message);
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
            gps: gps,
            car_ownership: carOwnership,
            car_payment_day: carOwnership === 'Propio' ? null : carPaymentDay,
            deposit: deposit,
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
      const handleImageClick = (imageUrl) =>
        setZoomedImage(imageUrl);

      // Close the zoom modal
      const closeModal = () => {
        setZoomedImage(null);
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

      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? t('Editar vehiculo') : t('')}
            </h2>
            <p className="text-gray-600">
              {licensePlate ? `${t('Matricula')}: ${licensePlate}` : t('Agregar un vehiculo')}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            {renderTabButtons()}
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
                  placeholder={t('Introducir marca')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Modelo')}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Introducir modelo')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Color')}</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar color')}
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
                  placeholder={t('Agregar matricula')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Vin')}</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={t('Agregar vin')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Millaje')}</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('Agregar millaje')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Estado')}</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('Seleccionar estado')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('Observaciones')}</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={4}
                  placeholder={t('Agregar observaciones')}
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{t('Fotos del vehiculo')}</h3>
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
                      onChange={(e) => setRearPhoto(e.target.files[0])}
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
                      onChange={(e) => setRightPhoto(e.target.files[0])}
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
                      onChange={(e) => setLeftPhoto(e.target.files[0])}
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
                      onChange={(e) => setDashboardPhoto(e.target.files[0])}
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
          )}

          {/* Historial Tab */}
          {activeTab === 'historial' && userRole === 'admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Historial de Mantenimientos</h3>
              {activityHistory.length > 0 ? (
                <div className="space-y-4">
                  {activityHistory.map((activity) => (
                    <div key={activity.activity_type} className="p-4 border rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{activity.activity_type}</span>
                        <span className="text-xs text-gray-500">{timeAgo(activity.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay historial de mantenimientos para este vehículo.</p>
              )}
            </div>
          )}

          {/* Reparaciones Tab */}
          {activeTab === 'reparaciones' && userRole === 'admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Reparaciones</h3>
              {reparaciones.length > 0 ? (
                <div className="space-y-4">
                  {reparaciones.map((reparacion) => (
                    <div key={reparacion.date} className="p-4 border rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{reparacion.activity_type}</span>
                        <span className="text-xs text-gray-500">{timeAgo(reparacion.date)}</span>
                      </div>
                      <p className="mt-2 text-gray-600">{reparacion.description}</p>
                      <p className="mt-1 text-gray-600">Monto: ${reparacion.amount}</p>
                    </div>
                  ))}
                  <div className="mt-4 border-t pt-2">
                    <p className="text-gray-700 font-semibold">Total: ${reparaciones.reduce((acc, reparacion) => acc + (reparacion.amount || 0), 0)}</p>
                  </div>
                </div>
              ) : (
                <p>No hay reparaciones para este vehículo.</p>
              )}
            </div>
          )}

          {/* Finanzas Tab */}
          {activeTab === 'finanzas' && userRole === 'admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Finanzas</h3>

              {/* Time Range Filters */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setFinancesTimeRange('all')}
                  className={`px-4 py-2 rounded-lg ${financesTimeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Historico
                </button>
                <button
                  onClick={() => setFinancesTimeRange('currentWeek')}
                  className={`px-4 py-2 rounded-lg ${financesTimeRange === 'currentWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Semana actual
                </button>
                <button
                  onClick={() => setFinancesTimeRange('lastWeek')}
                  className={`px-4 py-2 rounded-lg ${financesTimeRange === 'lastWeek' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Semana pasada
                </button>
                <button
                  onClick={() => setFinancesTimeRange('currentMonth')}
                  className={`px-4 py-2 rounded-lg ${financesTimeRange === 'currentMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Mes actual
                </button>
                <button
                  onClick={() => setFinancesTimeRange('lastMonth')}
                  className={`px-4 py-2 rounded-lg ${financesTimeRange === 'lastMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Mes pasado
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
                  <span className="material-icons text-green-500 text-3xl">trending_up</span>
                  <p className="text-gray-700 font-semibold">Ingresos Totales</p>
                  <p className="text-2xl">${finanzas.totalRevenue}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
                  <span className="material-icons text-red-500 text-3xl">warning</span>
                  <p className="text-gray-700 font-semibold">Ingresos Vencidos</p>
                  <p className="text-2xl">${finanzas.totalOverdueRevenue}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
                  <span className="material-icons text-blue-500 text-3xl">trending_down</span>
                  <p className="text-gray-700 font-semibold">Gastos Totales</p>
                  <p className="text-2xl">${finanzas.totalExpenses}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={gps}
                    onChange={(e) => setGps(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">GPS</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tipo de propiedad del vehiculo</label>
                <select
                  value={carOwnership}
                  onChange={(e) => setCarOwnership(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Propio">Propio</option>
                  <option value="Financiado">Financiado</option>
                </select>
              </div>

              {carOwnership === 'Financiado' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Dia de pago del vehiculo</label>
                  <input
                    type="number"
                    value={carPaymentDay}
                    onChange={(e) => setCarPaymentDay(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Dia del mes"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Deposito</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Deposito"
                />
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

          {