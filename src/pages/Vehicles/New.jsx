import React, { useState } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useNavigate, Link } from 'react-router-dom';

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
        mileage: '',
        status: '',
      });
      const navigate = useNavigate();

      const handleInputChange = (e) => {
        setNewVehicle({ ...newVehicle, [e.target.id]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('vehicles')
            .insert([newVehicle])
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
              <input type="text" id="status" name="status" value={newVehicle.status} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar vehiculo'}
              </button>
              <Link to="/vehicles" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ml-4">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      );
    };

    export default NewVehicle;
