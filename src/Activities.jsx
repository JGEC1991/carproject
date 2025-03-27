import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/Table';
import { Link, useNavigate } from 'react-router-dom';
import Popout from '../components/Popout';

const Activities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    status: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchVehicles(), fetchDrivers(), fetchActivities()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase.from('vehicles').select('id, make, model');
      if (error) setError(error.message);
      else setVehicles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase.from('drivers').select('id, name');
      if (error) setError(error.message);
      else setDrivers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchActivities = async () => {
    try {
      let query = supabase.from('activities').select(`
        id,
        activity_type,
        description,
        attachment_url,
        status,
        vehicle_id,
        driver_id,
        vehicles (make, model, license_plate),
        drivers (name)
      `);

      // Apply filters
      if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id);
      if (filters.driver_id) query = query.eq('driver_id', filters.driver_id);
      if (filters.activity_type) query = query.eq('activity_type', filters.activity_type);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setActivities(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      vehicle_id: '',
      driver_id: '',
      activity_type: '',
      status: '',
    });
  };

  const columns = [
    { key: 'date', title: 'Date', sortable: true },
    { key: 'vehicle_name', title: 'Vehicle', sortable: true, render: (activity) => `${activity.vehicles?.make || ''} ${activity.vehicles?.model || ''}` },
    { key: 'driver_name', title: 'Driver', sortable: true, render: (activity) => activity.drivers?.name },
    { key: 'activity_type', title: 'Activity Type', sortable: true },
    { key: 'description', title: 'Description', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
  ];

  return (
    <>
      <div className="page">
        <div className="max-w-5xl mx-auto mt-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-700 font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/filter.png" alt="Filter" style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={() => navigate('/activities/new')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <img src="https://ticghrxzdsdoaiwvahht.supabase.co/storage/v1/object/public/assets/Navigation/plus.png" alt="Add Activity" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <Popout isOpen={showFilters} onClose={() => setShowFilters(false)}>
            <h2 className="text-2xl font-semibold mb-4">Filters</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
            <select name="vehicle_id" value={filters.vehicle_id} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
            <label className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
            <select name="driver_id" value={filters.driver_id} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
            <label className="block text-gray-700 text-sm font-bold mb-2">Activity Type</label>
            <select name="activity_type" value={filters.activity_type} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Activity Type</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Past due">Past due</option>
              <option value="Canceled">Canceled</option>
            </select>
            <button onClick={clearFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Clear Filters
            </button>
          </Popout>

          {loading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
          ) : (
            <Table
              columns={columns}
              data={activities}
              onRowClick={(activity) => navigate(`/activities/${activity.id}`)}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Reusable Table Header Component
function TableHeader({ children }) {
  return (
    <th className="px-4 py-2 border-b-2 border-gray-300 bg-blue-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </th>
  );
}

// Reusable Table Data Cell Component
function TableData({ children }) {
  return (
    <td className="px-4 py-3 border-b border-gray-200 bg-stone-50 text-sm text-gray-600">
      {children}
    </td>
  );
}

export default Activities;
