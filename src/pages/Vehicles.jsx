import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/Table';
import { Link, useNavigate } from 'react-router-dom';

const Vehicles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceCadence, setMaintenanceCadence] = useState(30);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState({});
  const [availableModels, setAvailableModels] = useState([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
  const [filters, setFilters] = useState({
    Modelo: '',
    Estado: '',
    'Tipo de vehiculo': '',
    'Tipo de transmision': '',
    Año: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    'make',
    'model',
    'year',
    'color',
    'license_plate',
    'vin',
    'status',
    'vehicle_type',
    'fuel_type',
    'transmission_type',
    'insurance_provider',
    'insurance_policy_number',
    'registration_expiry_date',
  ]);

  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const allColumns = [
    { key: 'make', title: 'Marca', sortable: true },
    { key: 'model', title: 'Modelo', sortable: true },
    { key: 'year', title: 'Año', sortable: true },
    { key: 'color', title: 'Color', sortable: true },
    { key: 'license_plate', title: 'Matricula', sortable: true },
    { key: 'vin', title: 'VIN', sortable: true },
    { key: 'status', title: 'Estado', sortable: true },
    { key: 'vehicle_type', title: 'Tipo', sortable: true },
    { key: 'fuel_type', title: 'Combustible', sortable: true },
    { key: 'transmission_type', title: 'Transmision', sortable: true },
    { key: 'insurance_provider', title: 'Aseguradora', sortable: true },
    { key: 'insurance_policy_number', title: 'Poliza', sortable: true },
    { key: 'registration_expiry_date', title: 'Vencimiento', sortable: true },
    { key: 'mantenimiento', title: 'Mantenimiento', sortable: false, render: (vehicle) => maintenanceStatuses[vehicle.id] || "Cargando..." },
  ];

  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchVehicles();
      await fetchMaintenanceCadence();
      await fetchAvailableModels();
      await fetchAvailableVehicleTypes();
            await fetchAvailableYears();
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const calculateAllMaintenanceStatuses = async () => {
      const statuses = {};
      for (const vehicle of vehicles) {
        statuses[vehicle.id] = await calculateMaintenanceStatus(vehicle, maintenanceCadence);
      }
      setMaintenanceStatuses(statuses);
    };

    if (vehicles.length > 0) {
      calculateAllMaintenanceStatuses();
    }
  }, [vehicles, maintenanceCadence]);

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
        const page = 'Vehicles';

        // Load filters
        const { data: filterData, error: filterError } = await supabase
          .from('user_vehicle_filters')
          .select('filters')
          .eq('user_id', userId)
          .eq('page', page)
          .single();

        if (filterError && filterError.code !== 'PGRST116') {
          console.error('Error fetching filters:', filterError);
          setError(filterError.message);
        } else if (filterData) {
          setFilters(filterData.filters || {});
        }

        // Load visible columns
        const { data: columnData, error: columnError } = await supabase
          .from('user_vehicle_visible_columns')
          .select('columns')
          .eq('user_id', userId)
          .eq('page', page)
          .single();

        if (columnError && columnError.code !== 'PGRST116') {
          console.error('Error fetching visible columns:', columnError);
          setError(columnError.message);
        } else if (columnData) {
          setVisibleColumns(columnData.columns || []);
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
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('vehicles')
        .select('*');

      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          // Use the correct English key for filtering
          const englishKey = mapFilterKeyToEnglish(key);
          query = query.eq(englishKey, filters[key]);
        }
      });

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceCadence = async () => {
    try {
      // Fetch the maintenance cadence from the organizations table
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        setError(orgError.message);
        return;
      }

      const organizationId = userData?.organization_id;

      const { data: orgData, error: orgDataError } = await supabase
        .from('organizations')
        .select('maintenance_cadence_days')
        .eq('id', organizationId)
        .single();

      if (orgDataError) {
        console.error('Error fetching organization data:', orgDataError);
        setError(orgDataError.message);
        return;
      }

      setMaintenanceCadence(orgData?.maintenance_cadence_days || 30);
    } catch (err) {
      console.error('Error fetching maintenance cadence:', err.message);
      setError(err.message);
    }
  };

  const fetchAvailableModels = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('model')
        .neq('model', null);

      if (error) {
        console.error('Error fetching models:', error);
        return;
      }

      // Extract unique model names
      const uniqueModels = [...new Set(data.map(item => item.model))];
      setAvailableModels(uniqueModels);
    } catch (err) {
      console.error('Error fetching available models:', err.message);
      setError(err.message);
    }
  };

    const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('year')
        .neq('year', null);

      if (error) {
        console.error('Error fetching years:', error);
        return;
      }

      // Extract unique years
      const uniqueYears = [...new Set(data.map(item => item.year))];
      setAvailableYears(uniqueYears);
    } catch (err) {
      console.error('Error fetching available years:', err.message);
      setError(err.message);
    }
  };

  const fetchAvailableVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('vehicle_type')
        .neq('vehicle_type', null);

      if (error) {
        console.error('Error fetching vehicle types:', error);
        return;
      }

      // Extract unique vehicle types
      const uniqueVehicleTypes = [...new Set(data.map(item => item.vehicle_type))];
      setAvailableVehicleTypes(uniqueVehicleTypes);
    } catch (err) {
      console.error('Error fetching available vehicle types:', err.message);
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Seguro que desea eliminar el ${vehicle.make} ${vehicle.model}?`)) {
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);

        if (error) {
          setError(error.message);
          return;
        }

        setVehicles(vehicles.filter((v) => v.id !== vehicle.id)); // Remove the vehicle from the list
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateMaintenanceStatus = async (vehicle, maintenanceCadence) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('date')
        .eq('vehicle_id', vehicle.id)
        .eq('activity_type', 'Cambio de aceite')
        .eq('status', 'Completado')
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last oil change:', error);
        return "Error";
      }

      if (!data || data.length === 0) {
        return "No hay registros";
      }

      const lastOilChangeDate = new Date(data[0].date);
      const now = new Date();
      const diffInDays = Math.floor((now - lastOilChangeDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > maintenanceCadence) {
        return "Atrasado";
      } else {
        return "Al dia";
      }
    } catch (err) {
      console.error('Error calculating maintenance status:', err);
      return "Error";
    }
  };

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    fetchVehicles(); // Re-fetch vehicles when filters change
    saveFilters(newFilters);
  };

  const toggleColumnVisibility = async (key) => {
    const newVisibleColumns = visibleColumns.includes(key) ? visibleColumns.filter(k => k !== key) : [...visibleColumns, key];
    setVisibleColumns(newVisibleColumns);
    await saveVisibleColumns(newVisibleColumns);
  };

  const clearFilters = () => {
    const defaultFilters = {
      Modelo: '',
      Estado: '',
      'Tipo de vehiculo': '',
      'Tipo de transmision': '',
      Año: '',
    };
    setFilters(defaultFilters);
    fetchVehicles(); // Re-fetch vehicles when filters are cleared
    saveFilters(defaultFilters);
  };

  const mapFilterKeyToEnglish = (key) => {
    switch (key) {
      case 'Modelo': return 'model';
      case 'Estado': return 'status';
      case 'Tipo de vehiculo': return 'vehicle_type';
      case 'Tipo de transmision': return 'transmission_type';
      case 'Año': return 'year';
      default: return key;
    }
  };

  const saveFilters = async (newFilters) => {
    if (!userId) return;
    try {
      const page = 'Vehicles';
      console.log('Saving filters:', newFilters, 'for user:', userId, 'on page:', page);
      const { data, error } = await supabase
        .from('user_vehicle_filters')
        .upsert(
          [{ user_id: userId, page: page, filters: newFilters }],
          { onConflict: ['user_id', 'page'] }
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
      const page = 'Vehicles';
      console.log('Saving visible columns:', newVisibleColumns, 'for user:', userId, 'on page:', page);
      const { data, error } = await supabase
        .from('user_vehicle_visible_columns')
        .upsert(
          [{ user_id: userId, page: page, columns: newVisibleColumns }],
          { onConflict: ['user_id', 'page'] }
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
        <Link
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          to="/vehicles/new"
        >
          Agregar vehiculo
        </Link>
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-700 hover:text-blue-700 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
          >
            <span className="material-icons">filter_alt</span>
          </button>
          <button
            onClick={() => setShowColumnVisibility(!showColumnVisibility)}
            className="text-gray-700 hover:text-blue-700 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          >
            <span className="material-icons">view_column</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="Modelo" className="block text-gray-700 text-sm font-bold mb-2">Modelo</label>
            <select
              id="Modelo"
              name="Modelo"
              value={filters.Modelo}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="Estado" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
            <select
              id="Estado"
              name="Estado"
              value={filters.Estado}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Disponible">Disponible</option>
              <option value="En mantenimiento">En mantenimiento</option>
            </select>
          </div>
          <div>
            <label htmlFor="Tipo de vehiculo" className="block text-gray-700 text-sm font-bold mb-2">Tipo de vehiculo</label>
            <select
              id="Tipo de vehiculo"
              name="Tipo de vehiculo"
              value={filters['Tipo de vehiculo']}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              {availableVehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="Tipo de transmision" className="block text-gray-700 text-sm font-bold mb-2">Tipo de transmision</label>
            <select
              id="Tipo de transmision"
              name="Tipo de transmision"
              value={filters['Tipo de transmision']}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              <option value="Automatica">Automatica</option>
              <option value="Estandar">Estandar</option>
            </select>
          </div>
          <div>
            <label htmlFor="Año" className="block text-gray-700 text-sm font-bold mb-2">Año</label>
            <select
              id="Año"
              name="Año"
              value={filters.Año}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      )}

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
        {Object.values(filters).some(value => value) && (
          <button
            onClick={clearFilters}
            className="text-red-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <Table
        data={vehicles}
        columns={columns}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteVehicle}
        onRowClick={(vehicle) => navigate(`/vehicles/${vehicle.id}`)}
      />
    </div>
  );
};

export default Vehicles;
