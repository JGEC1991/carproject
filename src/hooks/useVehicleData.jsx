import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useVehicleData = (vehicleId) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();

        if (error) {
          console.error('Error fetching vehicle:', error);
          setError(error.message);
        } else {
          setVehicle(data);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  return { vehicle, loading, error };
};

export default useVehicleData;
