import React from 'react';

function ActivityRecordCard({ activity }) {
  return (
    <div>
      <h2>Detalles de actividad</h2>
      <p>Vehiculo: {activity?.vehicles?.make} {activity?.vehicles?.model} ({activity?.vehicles?.license_plate})</p>
      <p>Conductor: {activity?.drivers?.name}</p>
      <p>Tipo de actividad: {activity?.activity_type}</p>
      <p>Descripcion: {activity?.description}</p>
      {activity?.attachments && (
        <div>
          <h3>Archivos:</h3>
          {activity.attachments.map((url, index) => (
            <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityRecordCard;
