import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import ActivityRecordCard from '../../../src/components/ActivityRecordCard';

function ActivityRecord() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching activity:', error);
          alert(error.message);
        } else {
          setActivity(data);
        }
      } catch (error) {
        console.error('Error fetching activity:', error.message);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return <div className="page">Cargando detalles...</div>;
  }

  if (!activity) {
    return <div className="page">No se encontraron actividades.</div>;
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Detalles de actividad</h1>
      <ActivityRecordCard activity={activity} />
      <Link to="/activities" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Regresar a actividades</Link>
    </div>
  );
}

export default ActivityRecord;
