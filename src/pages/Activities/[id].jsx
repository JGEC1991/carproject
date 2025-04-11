import React, { useState, useEffect, useRef } from 'react';
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
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const modalRef = useRef(null);

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
        alert('Vehiculo actualizado exitosamente!');
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
        alert('Conductor actualizado exitosamente!');
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error('Error updating driver:', error.message);
      alert(error.message);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  const handleFileUpload = async () => {
    if (!attachment) return;

    setUploading(true);
    try {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${Date.now()}-attachment.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, attachment, {
          cacheControl: '3600',
          upsert: true,
          public: true,
          contentType: attachment.type,
        });

      if (error) {
        console.error('Error uploading attachment:', error);
        alert(error.message);
        return;
      }

      const imageUrl = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)
        .data.publicUrl;

      // Update the activity with the new attachment URL
      const { error: updateError } = await supabase
        .from('activities')
        .update({ attachment_url: imageUrl })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating activity record:', updateError);
        alert(updateError.message);
      } else {
        alert('Adjunto subido y registro de actividad actualizado exitosamente!');
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error('Error uploading attachment:', error.message);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const closeModal = () => {
    setExpandedImage(null);
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
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Adjuntos</h3>
                  {activity?.attachment_url ? (
                    <img
                      src={activity.attachment_url}
                      alt="Attachment"
                      className="rounded-lg w-40 h-40 object-cover cursor-pointer"
                      onClick={() => handleImageClick(activity.attachment_url)}
                    />
                  ) : (
                    <p>No se encontraron adjuntos.</p>
                  )}
                  <label className="block text-sm font-medium text-gray-700 mt-4">Subir archivo</label>
                  <input
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={handleAttachmentChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !attachment}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
                  >
                    {uploading ? 'Subiendo...' : 'Subir adjunto'}
                  </button>
                </div>
              );
            default:
              return <ActivityRecordCard activity={activity} activeTab={activeTab} customActivityTypes={customActivityTypes} />;
          }
        }}
      </RecordLayout>
      {expandedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={closeModal}>
          <div className="relative" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Expanded" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
            <button onClick={closeModal} className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRecord;
