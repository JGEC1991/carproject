import React from 'react';

function ActivityRecordCard({ activity }) {
  return (
    <div>
      <h2>Activity Details</h2>
      <p>Vehicle: {activity?.vehicles?.make} {activity?.vehicles?.model} ({activity?.vehicles?.license_plate})</p>
      <p>Driver: {activity?.drivers?.name}</p>
      <p>Activity Type: {activity?.activity_type}</p>
      <p>Description: {activity?.description}</p>
      {activity?.attachments && (
        <div>
          <h3>Attachments:</h3>
          {activity.attachments.map((url, index) => (
            <img key={index} src={url} alt={`Attachment ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityRecordCard;
