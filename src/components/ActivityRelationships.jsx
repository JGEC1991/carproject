import React from 'react';

function ActivityRelationships({ activity }) {
  return (
    <div>
      <h2>Relationships</h2>
      <p>Driver: {activity?.drivers?.name || 'N/A'}</p>
      <p>Vehicle: {activity?.vehicles?.make} {activity?.vehicles?.model} ({activity?.vehicles?.license_plate}) || 'N/A'</p>
    </div>
  );
}

export default ActivityRelationships;
