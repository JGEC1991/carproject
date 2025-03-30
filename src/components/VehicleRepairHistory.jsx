import React from 'react';

function VehicleRepairHistory({ reparaciones, timeAgo }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Reparaciones</h3>
      {reparaciones.length > 0 ? (
        <div className="space-y-4">
          {reparaciones.map((reparacion) => (
            <div key={reparacion.date} className="p-4 border rounded-md shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{reparacion.activity_type}</span>
                <span className="text-xs text-gray-500">{reparacion.date ? timeAgo(reparacion.date) : 'N/A'}</span>
              </div>
              <p className="mt-2 text-gray-600">{reparacion.description}</p>
              <p className="mt-1 text-gray-600">Monto: ${reparacion.amount}</p>
            </div>
          ))}
          <div className="mt-4 border-t pt-2">
            <p className="text-gray-700 font-semibold">Total: ${reparaciones.reduce((acc, reparacion) => acc + (reparacion.amount || 0), 0)}</p>
          </div>
        </div>
      ) : (
        <p>No hay reparaciones para este vehículo.</p>
      )}
    </div>
  );
}

export default VehicleRepairHistory;
