import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import ActivityRecordCard from '../../../src/components/ActivityRecordCard';
import RecordLayout from '../../../src/components/RecordLayout';
import ActivityRelationships from '../../../src/components/ActivityRelationships';

const activityTypes = [
  "Llanta averiada",
  "Afinamiento",
  "Pago de tarifa",
  "Otro",
  "Lavado de vehiculo",
  "Vehiculo remolcado",
  "Actualizacion de millaje",
  "Inspeccion fisica",
  "Reparacion",
  "Cambio de aceite",
  "Calibracion de llantas",
  "Cambio o relleno de coolant",
  "Cambio de frenos"
].sort();

function ActivityRecord() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('information');
  const navigate = useNavigate();
  const [customActivityTypes, setCustomActivityTypes] = useState([]);

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

    const fetchCustomActivityTypes = async () => {
      try {
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', authError);
          return;
        }
        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          return;
        }

        const organizationId = userData?.organization_id;

        const { data: customTypes, error: customTypesError } = await supabase
          .from('activity_types')
          .select('name')
          .eq('organization_id', organizationId);

        if (customTypesError) {
          console.error('Error fetching custom activity types:', customTypesError);
          return;
        }

        const customTypeNames = customTypes ? customTypes.map(type => type.name) : [];
        setCustomActivityTypes(customTypeNames);
      } catch (error) {
        console.error('Error fetching activity types:', error);
      }
    };

    fetchActivity();
    fetchCustomActivityTypes();
  }, [id]);

  const handleVehicleChange = async (newVehicleId) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ vehicle_id: newVehicleId })
        .eq('id', id);

      if (error) {
        console.error('Error updating vehicle:', error);
        alert(error.message);
      } else {
        setActivity({ ...activity, vehicle_id: newVehicleId });
        alert('Vehicle updated successfully!');
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error('Error updating vehicle:', error.message);
      alert(error.message);
    }
  };

  const handleDriverChange = async (newDriverId) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ driver_id: newDriverId })
        .eq('id', id);

      if (error) {
        console.error('Error updating driver:', error);
        alert(error.message);
      } else {
        setActivity({ ...activity, driver_id: newDriverId });
        alert('Driver updated successfully!');
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error('Error updating driver:', error.message);
      alert(error.message);
    }
  };

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
              return <ActivityRecordCard activity={activity} activeTab={activeTab} customActivityTypes={customActivityTypes} />;
            case 'relationships':
              return (
                <ActivityRelationships
                  activity={activity}
                  onVehicleChange={handleVehicleChange}
                  onDriverChange={handleDriverChange}
                />
              );
            case 'files':
              return (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Attachments</h3>
                  {activity?.attachment_url ? (
                    <img
                      src={activity.attachment_url}
                      alt="Attachment"
                      className="rounded-lg w-40 h-40 object-cover cursor-pointer"
                    />
                  ) : (
                    <p>No attachments available.</p>
                  )}
                </div>
              );
            default:
              return <ActivityRecordCard activity={activity} activeTab={activeTab} customActivityTypes={customActivityTypes} />;
          }
        }}
      </RecordLayout>
    </div>
  );
}

export default ActivityRecord;
