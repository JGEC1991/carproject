import React, { useState, useEffect } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { supabase } from '../../../supabaseClient';
    import VehicleRecordCard from '../../../src/components/VehicleRecordCard';

    function VehicleRecord() {
      const { id } = useParams();
      const [vehicle, setVehicle] = useState(null);
      const [loading, setLoading] = useState(true);
      const [drivers, setDrivers] = useState([]);
      const [selectedDriver, setSelectedDriver] = useState(null);

      useEffect(() => {
        const fetchVehicle = async () => {
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from('vehicles')
              .select('*')
              .eq('id', id)
              .single();

            if (error) {
              console.error('Error fetching vehicle:', error);
              alert(error.message);
            } else {
              setVehicle(data);
              setSelectedDriver(data.driver_id || null);
              console.log('Vehicle data:', data); // Add console log here
            }
          } catch (error) {
            console.error('Error fetching vehicle:', error.message);
            alert(error.message);
          } finally {
            setLoading(false);
          }
        };

        const fetchDrivers = async () => {
          try {
            const { data, error } = await supabase
              .from('drivers')
              .select('id, name');

            if (error) {
              console.error('Error fetching drivers:', error);
              alert(error.message);
            } else {
              setDrivers(data);
            }
          } catch (error) {
            console.error('Error fetching drivers:', error.message);
            alert(error.message);
          }
        };

        fetchVehicle();
        fetchDrivers();
      }, [id]);

      const handleAssignDriver = async () => {
        try {
          setLoading(true);

          // Update the vehicles table with the driver_id
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update({ driver_id: selectedDriver })
            .eq('id', id);

          if (vehicleError) {
            console.error('Error updating vehicle:', vehicleError);
            alert(vehicleError.message);
            return;
          }

          // If a driver is being assigned, update the drivers table to reflect the vehicle_id
          if (selectedDriver) {
            const { error: driverError } = await supabase
              .from('drivers')
              .update({ vehicle_id: id })
              .eq('id', selectedDriver);

            if (driverError) {
              console.error('Error updating driver:', driverError);
              alert(driverError.message);
              return;
            }
          } else {
            // If no driver is being assigned (unassigning), set vehicle_id to null for the previously assigned driver
            if (vehicle.driver_id) {
              const { error: driverClearError } = await supabase
                .from('drivers')
                .update({ vehicle_id: null })
                .eq('id', vehicle.driver_id);

              if (driverClearError) {
                console.error('Error clearing vehicle from driver:', driverClearError);
                alert(driverClearError.message);
                return;
              }
            }
          }

          alert('Driver assigned successfully!');
          window.location.reload(); // Refresh the page
        } catch (error) {
          console.error('Error assigning driver:', error.message);
          alert(error.message);
        } finally {
          setLoading(false);
        }
      };

      if (loading) {
        console.log('Loading vehicle details...'); // Add console log here
        return <div className="page">Cargando detalles...</div>;
      }

      if (!vehicle) {
        console.log('Vehicle not found.'); // Add console log here
        return <div className="page">No se encontraron vehiculos.</div>;
      }

      console.log('Rendering VehicleRecord component.'); // Add console log here

      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-semibold mb-4">Detalles de vehiculo</h1>
          <VehicleRecordCard vehicle={vehicle} isEditMode={true} />

          <div className="mt-4">
            <label htmlFor="driver" className="block text-gray-700 text-sm font-bold mb-2">
              Asignar Conductor:
            </label>
            <select
              id="driver"
              value={selectedDriver || ''}
              onChange={(e) => setSelectedDriver(e.target.value === '' ? null : e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Seleccionar conductor</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
              <option value="">Ninguno</option>
            </select>
          </div>

          <button
            onClick={handleAssignDriver}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            disabled={loading}
          >
            {loading ? 'Asignando...' : 'Asignar Conductor'}
          </button>
        </div>
      );
    }

    export default VehicleRecord;
