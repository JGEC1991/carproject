import React, { useState, useEffect } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useNavigate } from 'react-router-dom';

    function ActivityRelationships({ activity }) {
      const [vehicles, setVehicles] = useState([]);
      const [drivers, setDrivers] = useState([]);
      const [selectedVehicle, setSelectedVehicle] = useState(activity?.vehicle_id || '');
      const [selectedDriver, setSelectedDriver] = useState(activity?.driver_id || '');
      const navigate = useNavigate();

      useEffect(() => {
        const fetchVehicles = async () => {
          try {
            const { data, error } = await supabase
              .from('vehicles')
              .select('id, make, model, license_plate');

            if (error) {
              console.error('Error fetching vehicles:', error);
              alert(error.message);
            } else {
              setVehicles(data);
            }
          } catch (error) {
            console.error('Error fetching vehicles:', error.message);
            alert(error.message);
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

        fetchVehicles();
        fetchDrivers();
      }, []);

      const handleVehicleChange = async (e) => {
        const newVehicleId = e.target.value;
        try {
          const { error } = await supabase
            .from('activities')
            .update({ vehicle_id: newVehicleId })
            .eq('id', activity.id);

          if (error) {
            console.error('Error updating vehicle:', error);
            alert(error.message);
          } else {
            setSelectedVehicle(newVehicleId);
            alert('Vehicle updated successfully!');
            navigate(0); // Refresh the page
          }
        } catch (error) {
          console.error('Error updating vehicle:', error.message);
          alert(error.message);
        }
      };

      const handleDriverChange = async (e) => {
        const newDriverId = e.target.value;
        try {
          const { error } = await supabase
            .from('activities')
            .update({ driver_id: newDriverId })
            .eq('id', activity.id);

          if (error) {
            console.error('Error updating driver:', error);
            alert(error.message);
          } else {
            setSelectedDriver(newDriverId);
            alert('Driver updated successfully!');
            navigate(0); // Refresh the page
          }
        } catch (error) {
          console.error('Error updating driver:', error.message);
          alert(error.message);
        }
      };

      return (
        <div>
          <h2>Relationships</h2>
          <div>
            <label htmlFor="vehicle">Vehicle:</label>
            <select
              id="vehicle"
              value={selectedVehicle}
              onChange={handleVehicleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="driver">Driver:</label>
            <select
              id="driver"
              value={selectedDriver}
              onChange={handleDriverChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    export default ActivityRelationships;
