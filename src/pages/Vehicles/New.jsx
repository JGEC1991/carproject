import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "@material-tailwind/react";
import { Button } from '../../components/ui/button'; // Corrected import path

const NewVehicle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    vin: '',
    status: 'Disponible', // Default value
    observations: '',
  });
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [rearPhoto, setRearPhoto] = useState(null);
  const [rightPhoto, setRightPhoto] = useState(null);
  const [leftPhoto, setLeftPhoto] = useState(null);
  const [dashboardPhoto, setDashboardPhoto] = useState(null);
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState(null);

  const statusOptions = ['Disponible', 'Ocupado', 'En mantenimiento'];

  useEffect(() => {
    const fetchOrganizationId = async () => {
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
        console.error('Error fetching organization ID:', error.message);
        setError(error.message);
      }
    };

    fetchOrganizationId();
  }, []);

  const handleInputChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.id]: e.target.value });
  };

  const handleFileUpload = async (file, setImageState, fieldName) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${fieldName}.${fileExt}`;
      const filePath = `vehicles/${newVehicle.make}-${newVehicle.model}/${fieldName}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('vehicle-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading image:', error);
        setError(error.message);
        return null;
      }

      const imageUrl = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(filePath)
        .data.publicUrl;

      setImageState(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error.message);
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

      // Upload files and get URLs
      const frontImageUrl = await handleFileUpload(frontPhoto, setFrontPhoto, 'front_image_url');
      const rearImageUrl = await handleFileUpload(rearPhoto, setRearPhoto, 'rear_image_url');
      const rightImageUrl = await handleFileUpload(rightPhoto, setRightPhoto, 'right_image_url');
      const leftImageUrl = await handleFileUpload(leftPhoto, setLeftPhoto, 'left_image_url');
      const dashboardImageUrl = await handleFileUpload(dashboardPhoto, setDashboardPhoto, 'dashboard_image_url');

      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            ...newVehicle,
            organization_id: organizationId,
            front_image_url: frontImageUrl,
            rear_image_url: rearImageUrl,
            right_image_url: rightImageUrl,
            left_image_url: leftImageUrl,
            dashboard_image_url: dashboardImageUrl,
          },
        ])
        .select();

      if (error) {
        setError(error.message);
      } else {
        console.log('Vehicle added:', data);
        alert('Vehicle added successfully!');
        navigate('/vehicles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Agregar un vehiculo</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">Marca</label>
          <input type="text" id="make" name="make" value={newVehicle.make} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Modelo</label>
          <input type="text" id="model" name="model" value={newVehicle.model} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Año</label>
          <input type="number" id="year" name="year" value={newVehicle.year} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="color" className="block text-gray-700 text-sm font-bold mb-2">Color</label>
          <input type="text" id="color" name="color" value={newVehicle.color} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">Matricula</label>
          <input type="text" id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">VIN</label>
          <input type="text" id="vin" name="vin" value={newVehicle.vin} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="mileage" className="block text-gray-700 text-sm font-bold mb-2">Millaje</label>
          <input type="number" id="mileage" name="mileage" value={newVehicle.mileage} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
          <select id="status" name="status" value={newVehicle.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">Observaciones</label>
          <textarea id="observations" name="observations" value={newVehicle.observations} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="mb-4">
          <label htmlFor="frontPhoto" className="block text-gray-700 text-sm font-bold mb-2">Foto Frontal</label>
          <input type="file" id="frontPhoto" name="frontPhoto" accept="image/*" onChange={(e) => setFrontPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="rearPhoto" className="block text-gray-700 text-sm font-bold mb-2">Foto Trasera</label>
          <input type="file" id="rearPhoto" name="rearPhoto" accept="image/*" onChange={(e) => setRearPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="rightPhoto" className="block text-gray-700 text-sm font-bold mb-2">Foto Lateral Derecha</label>
          <input type="file" id="rightPhoto" name="rightPhoto" accept="image/*" onChange={(e) => setRightPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="leftPhoto" className="block text-gray-700 text-sm font-bold mb-2">Foto Lateral Izquierda</label>
          <input type="file" id="leftPhoto" name="leftPhoto" accept="image/*" onChange={(e) => setLeftPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="dashboardPhoto" className="block text-gray-700 text-sm font-bold mb-2">Foto del Tablero</label>
          <input type="file" id="dashboardPhoto" name="dashboardPhoto" accept="image/*" onChange={(e) => setDashboardPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar vehiculo'}
          </Button>
          <Link to="/vehicles" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ml-4">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NewVehicle;
