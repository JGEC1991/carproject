import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from './Modal';

const AutomaticActivities = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    name: '',
    use_case: '',
    activity_type: '',
    cadence: '',
    day_of_week: [],
    day_of_month: null,
    start_date: '',
    description: '',
    status: 'Pendiente',
    amount: 0,
    driver_id: null,
    vehicle_id: null,
  });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cadenceOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];
  const dayOfWeekOptions = [
    { value: 'Monday', label: 'Lunes' },
    { value: 'Tuesday', label: 'Martes' },
    { value: 'Wednesday', label: 'Miercoles' },
    { value: 'Thursday', label: 'Jueves' },
    { value: 'Friday', label: 'Viernes' },
    { value: 'Saturday', label: 'Sabado' },
    { value: 'Sunday', label: 'Domingo' }
  ];
  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const defaultActivityTypes = [
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

  useEffect(() => {
    const fetchOrganizationId = async () => {
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setError(`Error al obtener el usuario autenticado: ${authError.message}`);
          return;
        }

        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          setError(`Error al obtener la organización del usuario: ${orgError.message}`);
          return;
        }

        setOrganizationId(userData?.organization_id || null);
      } catch (error) {
        console.error('Error fetching organization ID:', error.message);
        setError(`Error inesperado al obtener la organización: ${error.message}`);
      }
    };

    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('id, make, model, license_plate');
        if (error) {
          console.error('Error fetching vehicles:', error);
          setError(`Error al obtener los vehiculos: ${error.message}`);
        } else {
          setVehicles(data);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err.message);
        setError(`Error inesperado al obtener los vehiculos: ${err.message}`);
      }
    };

    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase.from('drivers').select('id, name, vehicle_id');
        if (error) {
          console.error('Error fetching drivers:', error);
          setError(`Error al obtener los conductores: ${error.message}`);
        } else {
          setDrivers(data);
        }
      } catch (err) {
        console.error('Error fetching drivers:', err.message);
        setError(`Error inesperado al obtener los conductores: ${err.message}`);
      }
    };

    const fetchActivityTypes = async () => {
      try {
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setError(userError.message);
          return;
        }
        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          setError(orgError.message);
          return;
        }

        const organizationId = userData?.organization_id;

        const { data, error } = await supabase
          .from('activity_types')
          .select('name')
          .eq('organization_id', organizationId);

        if (error) {
          setError(error.message);
          return;
        }

        // Extract names from custom types and merge with default types
        const customTypeNames = data.map(type => type.name);
        const allTypes = [...new Set([...defaultActivityTypes, ...customTypeNames])].sort(); // Remove duplicates and sort

        setActivityTypeOptions(allTypes);
      } catch (error) {
        console.error('Error fetching activity types:', error);
      }
    };

    const fetchAutomaticActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!organizationId) {
          return;
        }

        const { data, error } = await supabase
          .from('automatic_activities')
          .select('*')
          .eq('organization_id', organizationId);

        if (error) {
          setError(error.message);
          return;
        }

        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationId();
    fetchVehicles();
    fetchDrivers();
    fetchActivityTypes();
    fetchAutomaticActivities();
  }, [organizationId]);

  useEffect(() => {
    // Auto-select vehicle when driver is selected
    if (newActivity.driver_id) {
      const driver = drivers.find(d => d.id === newActivity.driver_id);
      if (driver && driver.vehicle_id) {
        setNewActivity(prevState => ({ ...prevState, vehicle_id: driver.vehicle_id }));
      } else {
        // Clear vehicle selection if driver has no assigned vehicle
        setNewActivity(prevState => ({ ...prevState, vehicle_id: null }));
      }
    }
  }, [newActivity.driver_id, drivers]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'day_of_week') {
      const day = value;
      setNewActivity(prevState => {
        let newDays = [...prevState.day_of_week];
        if (checked) {
          newDays.push(day);
        } else {
          newDays = newDays.filter(d => d !== day);
        }
        return { ...prevState, day_of_week: newDays };
      });
    } else {
      setNewActivity(prevState => ({
        ...prevState,
        [name]: value,
        day_of_month: name === 'cadence' && value !== 'monthly' ? null : prevState.day_of_month,
      }));
    }
  };

  const openModal = (activity) => {
    setEditingActivityId(activity ? activity.id : null);
    setNewActivity(activity ? {
      name: activity.name,
      use_case: activity.use_case,
      activity_type: activity.activity_type,
      cadence: activity.cadence,
      day_of_week: activity.day_of_week || [],
      day_of_month: activity.day_of_month,
      start_date: activity.start_date,
      description: activity.description,
      status: activity.status,
      amount: activity.amount,
      driver_id: activity.driver_id,
      vehicle_id: activity.vehicle_id,
    } : {
      name: '',
      use_case: '',
      activity_type: '',
      cadence: '',
      day_of_week: [],
      day_of_month: null,
      start_date: '',
      description: '',
      status: 'Pendiente',
      amount: 0,
      driver_id: null,
      vehicle_id: null,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingActivityId(null);
    setNewActivity({
      name: '',
      use_case: '',
      activity_type: '',
      cadence: '',
      day_of_week: [],
      day_of_month: null,
      start_date: '',
      description: '',
      status: 'Pendiente',
      amount: 0,
      driver_id: null,
      vehicle_id: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!organizationId) {
        setError('Organization ID not found. Please refresh the page.');
        return;
      }

      let query = supabase.from('automatic_activities');

      if (editingActivityId) {
        // Update existing activity
        query = query.update({
          name: newActivity.name,
          use_case: newActivity.use_case,
          activity_type: newActivity.activity_type,
          cadence: newActivity.cadence,
          day_of_week: newActivity.day_of_week.length > 0 ? newActivity.day_of_week : null,
          day_of_month: newActivity.cadence !== 'monthly' ? null : newActivity.day_of_month,
          start_date: newActivity.start_date || null,
          description: newActivity.description,
          status: newActivity.status,
          amount: newActivity.amount,
          driver_id: newActivity.driver_id,
          vehicle_id: newActivity.vehicle_id,
          organization_id: organizationId,
        }).eq('id', editingActivityId);
      } else {
        // Insert new activity
        query = query.insert([
          {
            name: newActivity.name,
            use_case: newActivity.use_case,
            activity_type: newActivity.activity_type,
            cadence: newActivity.cadence,
            day_of_week: newActivity.day_of_week.length > 0 ? newActivity.day_of_week : null,
            day_of_month: newActivity.cadence !== 'monthly' ? null : newActivity.day_of_month,
            start_date: newActivity.start_date || null,
            description: newActivity.description,
            status: newActivity.status,
            amount: newActivity.amount,
            driver_id: newActivity.driver_id,
            vehicle_id: newActivity.vehicle_id,
            organization_id: organizationId,
          },
        ]);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(`Error al ${editingActivityId ? 'actualizar' : 'agregar'} actividad automatica: ${error.message}`);
      } else {
        console.log('Automatic activity added:', data);
        alert(`Actividad automatica ${editingActivityId ? 'actualizada' : 'agregada'} exitosamente!`);
        setNewActivity({
          name: '',
          use_case: '',
          activity_type: '',
          cadence: '',
          day_of_week: [],
          day_of_month: null,
          start_date: '',
          description: '',
          status: 'Pendiente',
          amount: 0,
          driver_id: null,
          vehicle_id: null,
        });
        setEditingActivityId(null); // Clear editing ID after successful submission
        setIsModalOpen(false);

        // Refresh activities
        const { data: newData, error: newError } = await supabase
          .from('automatic_activities')
          .select('*')
          .eq('organization_id', organizationId);

        if (newError) {
          setError(`Error al refrescar actividades automaticas: ${newError.message}`);
          return;
        }

        setActivities(newData);
      }
    } catch (err) {
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this automatic activity?')) {
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from('automatic_activities')
          .delete()
          .eq('id', id);

        if (error) {
          setError(`Error al eliminar actividad automatica: ${error.message}`);
          return;
        }

        setActivities(activities.filter((activity) => activity.id !== id));
      } catch (err) {
        setError(`Error inesperado: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Removed the h2 header here */}
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {/* Add/Edit Automatic Activity Form */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="mb-8 bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{editingActivityId ? 'Editar actividad automatica' : 'Agregar nueva actividad automatica'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                <input type="text" id="name" name="name" value={newActivity.name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="use_case" className="block text-gray-700 text-sm font-bold mb-2">Caso de uso</label>
                <input type="text" id="use_case" name="use_case" value={newActivity.use_case} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Tipo de actividad</label>
                <select id="activity_type" name="activity_type" value={newActivity.activity_type} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Seleccionar tipo de actividad</option>
                  {activityTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cadence" className="block text-gray-700 text-sm font-bold mb-2">Cadencia</label>
                <select id="cadence" name="cadence" value={newActivity.cadence} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Seleccionar cadencia</option>
                  {cadenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              {newActivity.cadence === 'weekly' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Dia de la semana</label>
                  <div className="flex flex-wrap">
                    {dayOfWeekOptions.map((day) => (
                      <label key={day.value} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          id={`day_of_week_${day.value}`}
                          name="day_of_week"
                          value={day.value}
                          checked={newActivity.day_of_week.includes(day.value)}
                          onChange={handleInputChange}
                          className="mr-2 leading-tight"
                        />
                        <span className="text-gray-700">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {newActivity.cadence === 'monthly' && (
                <div>
                  <label htmlFor="day_of_month" className="block text-gray-700 text-sm font-bold mb-2">Dia del mes</label>
                  <input type="number" id="day_of_month" name="day_of_month" value={newActivity.day_of_month} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" min="1" max="31" />
                </div>
              )}
              <div>
                <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">Fecha de inicio</label>
                <input type="date" id="start_date" name="start_date" value={newActivity.start_date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descripcion</label>
                <textarea id="description" name="description" value={newActivity.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
                <select id="status" name="status" value={newActivity.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Seleccionar estado</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Monto</label>
                <input type="number" id="amount" name="amount" value={newActivity.amount} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
                <select id="driver_id" name="driver_id" value={newActivity.driver_id || ''} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Seleccionar conductor</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
                <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id || ''} onChange={handleInputChange} disabled className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Seleccionar vehiculo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.license_plate})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {loading ? 'Guardando...' : 'Guardar actividad automatica'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Display Existing Automatic Activities */}
      <button
        onClick={() => openModal(null)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
      >
        Agregar nueva actividad automatica
      </button>
      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white shadow-md rounded-lg p-4">
              <h4 className="text-lg font-semibold">{activity.name}</h4>
              <p className="text-gray-600">{activity.use_case}</p>
              <p className="text-gray-600">Tipo: {activity.activity_type}</p>
              <p className="text-gray-600">Cadencia: {activity.cadence}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => openModal(activity)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay actividades automaticas.</p>
      )}
    </div>
  );
};

export default AutomaticActivities;
