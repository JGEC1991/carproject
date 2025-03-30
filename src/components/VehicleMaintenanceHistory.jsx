import React from 'react';

function VehicleMaintenanceHistory({ activityHistory, timeAgo }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Historial de Mantenimientos</h3>
      {activityHistory.length > 0 ? (
        <div className="space-y-4">
          {activityHistory.map((activity) => (
            <div key={activity.activity_type} className="p-4 border rounded-md shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{activity.activity_type}</span>
                <span className="text-xs text-gray-500">{activity.date ? timeAgo(activity.date) : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay historial de mantenimientos para este vehículo.</p>
      )}
    </div>
  );
}

export default VehicleMaintenanceHistory;
