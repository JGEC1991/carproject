import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import VehicleRecordCard from '../../../src/components/VehicleRecordCard';

function VehicleRecord() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error.message);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return <div className="page">Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div className="page">Vehicle not found.</div>;
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Vehicle Details</h1>
      <VehicleRecordCard vehicle={vehicle} isEditMode={true} />
      <Link to="/vehicles" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Back to Vehicles</Link>
    </div>
  );
}

export default VehicleRecord;
