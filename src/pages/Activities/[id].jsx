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
          console.log('Activity data:', data); // Add console log here
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
    console.log('Loading activity details...'); // Add console log here
    return <div className="page">Cargando detalles...</div>;
  }

  if (!activity) {
    console.log('Activity not found.'); // Add console log here
    return <div className="page">No se encontraron actividades.</div>;
  }

  console.log('Rendering ActivityRecord component.'); // Add console log here

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Detalles de actividad</h1>
      <ActivityRecordCard activity={activity} />
    </div>
  );
}

export default ActivityRecord;
