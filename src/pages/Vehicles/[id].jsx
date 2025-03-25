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
          console.log('Vehicle data:', data); // Add console log here
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
    console.log('Loading vehicle details...'); // Add console log here
    return <div className="page">Cargando detalles...</div>;
  }

  if (!vehicle) {
    console.log('Vehicle not found.'); // Add console log here
    return <div className="page">No se encontraron vehiculos.</div>;
  }

  console.log('Rendering VehicleRecord component.'); // Add console log here

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Detalles de vehiculo</h1>
      <VehicleRecordCard vehicle={vehicle} isEditMode={true} />
    </div>
  );
}

export default VehicleRecord;
