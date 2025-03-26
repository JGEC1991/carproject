import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import ActivityRecordCard from '../../../src/components/ActivityRecordCard';
import RecordLayout from '../../../src/components/RecordLayout';
import ActivityRelationships from '../../../src/components/ActivityRelationships';

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
          .select('*, vehicles(make, model, license_plate), drivers(name)')
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

  const tabs = [
    { key: 'information', label: 'Informacion' },
    { key: 'relationships', label: 'Relaciones' },
    { key: 'files', label: 'Archivos' },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Detalles de actividad</h1>
      <RecordLayout tabs={tabs}>
        {(activeTab) => {
          switch (activeTab) {
            case 'information':
              return <ActivityRecordCard activity={activity} />;
            case 'relationships':
              return <ActivityRelationships activity={activity} />;
            case 'files':
              return <div>Files Content</div>;
            default:
              return <ActivityRecordCard activity={activity} />;
          }
        }}
      </RecordLayout>
    </div>
  );
}

export default ActivityRecord;
