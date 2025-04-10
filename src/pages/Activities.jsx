import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ActivitiesTable from '../components/ActivitiesTable';
import ActivitiesFilters from '../components/ActivitiesFilters';
import ActivitiesActiveFilters from '../components/ActivitiesActiveFilters';
import { Link, useNavigate } from 'react-router-dom';
import { unparse } from 'papaparse';
import { Button } from '../components/ui/button'; // Corrected import path

const Activities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    activityType: '',
    driverId: '',
    vehicleId: '',
    status: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    'date',
    'description',
    'activity_type',
    'vehicle_name',
    'driver_name',
    'status',
    'amount',
  ]);

  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const columnMap = {
    date: 'Fecha',
    description: 'Descripcion',
    activity_type: 'Tipo de actividad',
    vehicle_name: 'Vehiculo',
    driver_name: 'Conductor',
    status: 'Estado',
    amount: 'Monto',
  };

  const allColumns = [
    { key: 'date', title: 'Fecha', sortable: true },
    { key: 'description', title: 'Descripcion', sortable: true },
    { key: 'activity_type', title: 'Tipo de actividad', sortable: true },
    { key: 'vehicle_name', title: 'Vehiculo', sortable: true },
    { key: 'driver_name', title: 'Conductor', sortable: true },
    { key: 'status', title: 'Estado', sortable: true },
    { key: 'amount', title: 'Monto', sortable: true },
  ];

  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

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
    const fetchInitialData = async () => {
      await fetchVehicles();
      await fetchDrivers();
      await fetchActivityTypes();
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        return;
      }
      setUserId(authUser?.user?.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Load filters
        const { data: filterData, error: filterError } = await supabase
          .from('user_filters')
          .select('filter_data')
          .eq('user_id', userId)
          .single();
        if (filterError && filterError.code !== 'PGRST116') {
          console.error('Error fetching filters:', filterError);
          setError(filterError.message);
        } else if (filterData) {
          setFilters(filterData.filter_data || {});
        }

        // Load visible columns
        const { data: columnData, error: columnError } = await supabase
          .from('user_visible_columns')
          .select('visible_columns')
          .eq('user_id', userId)
          .single();
        if (columnError && columnError.code !== 'PGRST116') {
          console.error('Error fetching visible columns:', columnError);
          setError(columnError.message);
        } else if (columnData) {
          setVisibleColumns(columnData.visible_columns || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserPreferences();
    }
  }, [userId]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase.from('vehicles').select('id, make, model, license_plate');
      if (error) {
        console.error('Error fetching vehicles:', error);
        setError(error.message);
      } else {
        setVehicles(data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err.message);
      setError(err.message);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase.from('drivers').select('id, name');
      if (error) {
        console.error('Error fetching drivers:', error);
        setError(error.message);
      } else {
        setDrivers(data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err.message);
      setError(err.message);
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const { data, error } = await supabase.from('activity_types').select('name');
      if (error) {
        console.error('Error fetching activity types:', error);
        setError(error.message);
      } else {
        // Combine default activity types with fetched activity types
        const allActivityTypes = [...new Set([...defaultActivityTypes, ...data.map(type => type.name)])].sort();
        setActivityTypeOptions(allActivityTypes);
      }
    } catch (err) {
      console.error('Error fetching activity types:', err.message);
      setError(err.message);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('activities')
        .select('*, vehicles(make, model, license_plate), drivers(name)')
        .order('date', { ascending: false });

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      if (filters.activityType) {
        query = query.eq('activity_type', filters.activityType);
      }
      if (filters.driverId) {
        query = query.eq('driver_id', filters.driverId);
      }
      if (filters.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      // Process the data to include driver and vehicle names
      const processedActivities = data.map(activity => ({
        ...activity,
        vehicle_name: activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model} (${activity.vehicles.license_plate})` : 'N/A',
        driver_name: activity.drivers ? activity.drivers.name : 'N/A',
      }));

      setActivities(processedActivities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activity) => {
    if (window.confirm(`Aun quieres borrar la actividad?`)) {
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', activity.id);

        if (error) {
          if (error.code === '23503') {
            setError("La actividad no se puede borrar por que esta asociada con otro registro.");
          } else {
            setError(error.message);
          }
          return;
        }

        setActivities(activities.filter((a) => a.id !== activity.id)); // Remove the activity from the list
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  const toggleColumnVisibility = async (key) => {
    const newVisibleColumns = visibleColumns.includes(key) ? visibleColumns.filter(k => k !== key) : [...visibleColumns, key];
    setVisibleColumns(newVisibleColumns);
    await saveVisibleColumns(newVisibleColumns);
  };

  const clearFilters = () => {
    const defaultFilters = {
      dateFrom: '',
      dateTo: '',
      activityType: '',
      driverId: '',
      vehicleId: '',
      status: '',
    };
    setFilters(defaultFilters);
    saveFilters(defaultFilters);
  };

  const getVehicleDisplayName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})` : 'N/A';
  };

  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value !== '')
    .map( ([key, value]) => {
      let label = key;
      let displayValue = value;
      if (key === 'dateFrom') label = 'Fecha desde';
      if (key === 'dateTo') label = 'Fecha hasta';
      if (key === 'activityType') label = 'Tipo de actividad';
      if (key === 'driverId') {
        label = 'Conductor';
        const driver = drivers.find(d => d.id === value);
        displayValue = driver ? driver.name : 'N/A';
      }
      if (key === 'vehicleId') {
        label = 'Vehiculo';
        displayValue = getVehicleDisplayName(value);
      }
      if (key === 'status') label = 'Estado';
      return { label, value: displayValue };
    });

  const exportToCSV = () => {
    const csvData = unparse(activities, {
      fields: columns.map(col => col.key),
      columnNames: columns.map(col => columnMap[col.key] || col.title)
    });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveFilters = async (newFilters) => {
    if (!userId) return;
    try {
      console.log('Saving filters:', newFilters, 'for user:', userId);
      const { data, error } = await supabase
        .from('user_filters')
        .upsert(
          [{ user_id: userId, filter_data: newFilters }],
          { onConflict: 'user_id' }
        )
        .select();

      if (error) {
        console.error('Error saving filters:', error);
        setError(error.message);
      } else {
        console.log('Filters saved successfully:', data);
      }
    } catch (err) {
      console.error('Unexpected error saving filters:', err);
      setError(err.message);
    }
  };

  const saveVisibleColumns = async (newVisibleColumns) => {
    if (!userId) return;
    try {
      console.log('Saving visible columns:', newVisibleColumns, 'for user:', userId);
      const { data, error } = await supabase
        .from('user_visible_columns')
        .upsert(
          [{ user_id: userId, visible_columns: newVisibleColumns }],
          { onConflict: 'user_id' }
        )
        .select();

      if (error) {
        console.error('Error saving visible columns:', error);
        setError(error.message);
      } else {
        console.log('Visible columns saved successfully:', data);
      }
    } catch (err) {
      console.error('Unexpected error saving visible columns:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <Button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          as={Link}
          to="/activities/new"
        >
          Agregar actividad
        </Button>
        <div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-700 hover:text-blue-700 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
            variant="ghost"
          >
            <span className="material-icons">filter_alt</span>
          </Button>
          <Button
            onClick={() => setShowColumnVisibility(!showColumnVisibility)}
            className="text-gray-700 hover:text-blue-700 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
            variant="ghost"
          >
            <span className="material-icons">view_column</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ActivitiesFilters
          filters={filters}
          activityTypeOptions={activityTypeOptions}
          drivers={drivers}
          vehicles={vehicles}
          handleFilterChange={handleFilterChange}
        />
      )}

      {/* Active Filters Display */}
      <ActivitiesActiveFilters activeFilters={activeFilters} />

      {/* Column Visibility Toggle */}
      {showColumnVisibility && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Mostrar/Ocultar columnas</h3>
          <div className="flex flex-wrap gap-2">
            {allColumns.map(column => (
              <label key={column.key} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  value={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onChange={() => toggleColumnVisibility(column.key)}
                />
                <span className="ml-2 text-gray-700">{column.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        {activeFilters.length > 0 && (
          <Button
            onClick={clearFilters}
            className="text-red-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
            variant="ghost"
          >
            Limpiar filtros
          </Button>
        )}
        <Button
          onClick={exportToCSV}
          className="text-blue-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
          variant="ghost"
        >
          Exportar a CSV
        </Button>
      </div>

      <ActivitiesTable
        activities={activities}
        columns={columns}
        handleDeleteActivity={handleDeleteActivity}
        columnMap={columnMap}
      />
    </div>
  );
};

export default Activities;
