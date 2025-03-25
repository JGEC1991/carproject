import React from 'react';

function RevenueRecordCard({ revenue }) {
  return (
    <div>
      <h2>Detalles de ingreso</h2>
      <p>Fecha: {revenue?.date}</p>
      <p>Cantidad: {revenue?.amount}</p>
      <p>Descripcion: {revenue?.description}</p>
      <p>Estado: {revenue?.status}</p>
      <p>Tipo de Actividad: {revenue?.activity_type}</p>
      <p>Conductor: {revenue?.driver_name}</p>
      <p>Vehiculo: {revenue?.vehicle_name}</p>
      {revenue?.proof_of_payment_url && (
        <p>
          Recibo/Factura:
          <a href={revenue.proof_of_payment_url} target="_blank" rel="noopener noreferrer">
            Ver archivo
          </a>
        </p>
      )}
    </div>
  );
}

export default RevenueRecordCard;
