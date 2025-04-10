import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Typography, Select, Option } from "@material-tailwind/react";

const NewActivity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newActivity, setNewActivity] = useState({
    date: '',
    vehicle_id: '',
    driver_id: '',
    activity_type: '',
    description: '',
    status: 'Pendiente',
    amount: 0, // Add amount field with a default value
  });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState(null);
  const [customActivityTypes, setCustomActivityTypes] = useState([]);

  const statusOptions = ['Pendiente', 'Completado', 'Vencido', 'Cancelado'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setError(authError.message);
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

        setOrganizationId(userData?.organization_id || null);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        setError(error.message);
      }
    };

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

    const fetchCustomActivityTypes = async () => {
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

        const { data: customTypes, error: customTypesError } = await supabase
          .from('activity_types')
          .select('name')
          .eq('organization_id', organizationId);

        if (customTypesError) {
          console.error('Error fetching custom activity types:', customTypesError);
          return;
        }

        const customTypeNames = customTypes ? customTypes.map(type => type.name) : [];
        setCustomActivityTypes(customTypeNames);
      } catch (error) {
        console.error('Error fetching activity types:', error);
      }
    };

    fetchUserData();
    fetchVehicles();
    fetchDrivers();
    fetchCustomActivityTypes();
  }, []);

  const handleInputChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.id]: e.target.value });
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-attachment.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading attachment:', error);
        setError(error.message);
        return null;
      }

      const imageUrl = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)
        .data.publicUrl;

      return imageUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error.message);
      setError(error.message);
      return null;
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

        const attachmentUrl = await handleFileUpload(attachment);

        const { data, error } = await supabase
          .from('activities')
          .insert([
            {
              date: newActivity.date,
              vehicle_id: newActivity.vehicle_id,
              driver_id: newActivity.driver_id,
              activity_type: newActivity.activity_type,
              description: newActivity.description,
              status: newActivity.status,
              amount: newActivity.amount,
              organization_id: organizationId,
              attachment_url: attachmentUrl,
            },
          ])
          .select();

        if (error) {
          setError(error.message);
        } else {
          console.log('Activity added:', data);
          alert('Activity added successfully!');
          navigate('/activities');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const allActivityTypes = [...new Set([...activityTypes, ...customActivityTypes])].sort();

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-4">Agregar una actividad</h1>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
            <input type="date" id="date" name="date" value={newActivity.date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descripcion</label>
            <textarea id="description" name="description" value={newActivity.description} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Tipo de actividad</label>
            <select id="activity_type" name="activity_type" value={newActivity.activity_type} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Selecciona un tipo de actividad</option>
              {allActivityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
            <select id="vehicle_id" name="vehicle_id" value={newActivity.vehicle_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Selecciona un vehiculo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
            <select id="driver_id" name="driver_id" value={newActivity.driver_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Selecciona un conductor</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
            <select id="status" name="status" value={newActivity.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
            <option value="Vencido">Vencido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Monto</label>
          <input type="number" id="amount" name="amount" value={newActivity.amount} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="attachment" className="block text-gray-700 text-sm font-bold mb-2">Adjuntar archivo</label>
          <input type="file" id="attachment" name="attachment" accept="image/*, application/pdf" onChange={(e) => setAttachment(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar actividad'}
          </Button>
          <Link to="/activities" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ml-4">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NewActivity;
