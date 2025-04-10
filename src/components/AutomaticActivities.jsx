import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Select,
  Option,
  Button,
} from "@material-tailwind/react";
// import { Button } from "@/components/ui/button";

const AutomaticActivities = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    activity_type: '',
    cadence: '',
    day_of_week: [], // Changed to array
    day_of_month: null, // Changed to null
    start_date: '',
    end_date: '',
    description: '',
    status: 'Pendiente',
    amount: 0,
    apply_to_type: '',
    vehicle_id: null,
    driver_id: null,
    vehicle_status: null,
  });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);

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
  const applyToOptions = [
    { value: 'all_vehicles', label: 'Todos los vehiculos' },
    { value: 'all_drivers', label: 'Todos los conductores' },
    { value: 'specific_vehicle', label: 'Vehiculo especifico' },
    { value: 'specific_driver', label: 'Conductor especifico' },
    { value: 'vehicle_status', label: 'Estado del vehiculo' }
  ];
  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];
  const vehicleStatusOptions = [
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Ocupado', label: 'Ocupado' },
    { value: 'Mantenimiento', label: 'Mantenimiento' }
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
        const { data, error } = await supabase.from('drivers').select('id, name');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!organizationId) {
        setError('Organization ID not found. Please refresh the page.');
        return;
      }

      const { data, error } = await supabase
        .from('automatic_activities')
        .insert([
          {
            ...newActivity,
            organization_id: organizationId,
            day_of_week: newActivity.day_of_week.length > 0 ? newActivity.day_of_week : null,
            day_of_month: newActivity.cadence !== 'monthly' ? null : newActivity.day_of_month,
            start_date: newActivity.start_date || null,
            end_date: newActivity.end_date || null,
          },
        ])
        .select();

      if (error) {
        setError(`Error al agregar actividad automatica: ${error.message}`);
      } else {
        console.log('Automatic activity added:', data);
        alert('Actividad automatica agregada exitosamente!');
        setNewActivity({
          activity_type: '',
          cadence: '',
          day_of_week: [],
          day_of_month: null,
          start_date: '',
          end_date: '',
          description: '',
          status: 'Pendiente',
          amount: 0,
          apply_to_type: '',
          vehicle_id: null,
          driver_id: null,
          vehicle_status: null,
        });
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
      <h2 className="text-2xl font-semibold mb-4">Administrar actividades automaticas</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {/* Add New Automatic Activity Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="form-checkbox h-5 w-5 text-blue-600"
                      name="day_of_week"
                      value={day.value}
                      checked={newActivity.day_of_week.includes(day.value)}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2 text-gray-700">{day.label}</span>
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
            <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">Fecha de finalizacion</label>
            <input type="date" id="end_date" name="end_date" value={newActivity.end_date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
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
                <option key={option.value} value={option.value}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Monto</label>
            <input type="number" id="amount" name="amount" value={newActivity.amount} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="apply_to_type" className="block text-gray-700 text-sm font-bold mb-2">Aplicar a</label>
            <select id="apply_to_type" name="apply_to_type" value={newActivity.apply_to_type} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Seleccionar aplicacion</option>
              {applyToOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {newActivity.apply_to_type === 'specific_vehicle' && (
            <div>
              <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
              <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id || ''} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Seleccionar vehiculo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.license_plate})</option>
                ))}
              </select>
            </div>
          )}
          {newActivity.apply_to_type === 'specific_driver' && (
            <div>
              <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
              <select id="driver_id" name="driver_id" value={newActivity.driver_id || ''} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Seleccionar conductor</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
          )}
          {newActivity.apply_to_type === 'vehicle_status' && (
            <div>
              <label htmlFor="vehicle_status" className="block text-gray-700 text-sm font-bold mb-2">Estado del vehiculo</label>
              <select id="vehicle_status" name="vehicle_status" value={newActivity.vehicle_status || ''} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Seleccionar estado</option>
                {vehicleStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar actividad automatica'}
          </Button>
        </div>
      </form>

      {/* Display Existing Automatic Activities */}
      <h3 className="text-xl font-semibold mb-4">Actividades automaticas existentes</h3>
      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white shadow-md rounded-lg p-4">
              <p>Tipo: {activity.activity_type}</p>
              <p>Cadencia: {activity.cadence}</p>
              <p>Aplicar a: {activity.apply_to_type}</p>
              <Button
                onClick={() => handleDeleteActivity(activity.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm mt-2"
              >
                Borrar
              </Button>
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
