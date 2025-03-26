import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import DriverRecordCard from '../../../src/components/DriverRecordCard';

function DriverRecord() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchDriver = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching driver:', error);
          alert(error.message);
        } else {
          setDriver(data);
        }
      } catch (error) {
        console.error('Error fetching driver:', error.message);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  if (loading) {
    return <div className="page">Cargando detalles...</div>;
  }

  if (!driver) {
    return <div className="page">No se encontraron conductores.</div>;
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Detalles de conductor</h1>
      <DriverRecordCard driver={driver} activeTab={activeTab} setActiveTab={setActiveTab} />
      <Link to="/drivers" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Regresar a conductores</Link>
    </div>
  );
}

export default DriverRecord;
