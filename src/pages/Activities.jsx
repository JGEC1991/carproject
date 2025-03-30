import { useState, useEffect } from 'react';
    import { supabase } from '../supabaseClient';
    import Table from '../components/Table';
    import { Link, useNavigate } from 'react-router-dom';
    import { unparse } from 'papaparse';

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
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

      const toggleColumnVisibility = (key) => {
        setVisibleColumns(prev =>
          prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
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
          if (key === 'vehicleId') label = 'Vehiculo';
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
              to="/activities/new"
            >
              Agregar actividad
            </Link>
            <div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
              >
                <span className="material-icons">filter_list</span>
              </button>
              <button
                onClick={() => setShowColumnVisibility(!showColumnVisibility)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
              >
                <span className="material-icons">view_column</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dateFrom" className="block text-gray-700 text-sm font-bold mb-2">Fecha desde</label>
                <input type="date" id="dateFrom" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-gray-700 text-sm font-bold mb-2">Fecha hasta</label>
                <input type="date" id="dateTo" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="activityType" className="block text-gray-700 text-sm font-bold mb-2">Tipo de actividad</label>
                <select id="activityType" name="activityType" value={filters.activityType} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Todos</option>
                  {activityTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="driverId" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
                <select id="driverId" name="driverId" value={filters.driverId} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Todos</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vehicleId" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
                <select id="vehicleId" name="vehicleId" value={filters.vehicleId} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Todos</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.license_plate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Completado">Completado</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="mb-4">
              <span className="font-bold">Filtros:</span>
              {activeFilters.map((filter) => (
                <span key={filter.label} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                  {filter.label}: {filter.value}
                </span>
              ))}
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

          <div className="flex justify-end mb-4">
            <button
              onClick={exportToCSV}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
            >
              Exportar a CSV
            </button>
          </div>

          <Table
            data={activities}
            columns={columns}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={handleDeleteActivity}
            onRowClick={(activity) => navigate(`/activities/${activity.id}`)}
            className="shadow-md rounded-lg"
          />
        </div>
      );
    };

    export default Activities;
