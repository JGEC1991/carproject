import React from 'react';

function RevenueRecordCard({ revenue }) {
  return (
    <div>
      <h2>Revenue Details</h2>
      <p>Date: {revenue?.date}</p>
      <p>Amount: {revenue?.amount}</p>
      <p>Description: {revenue?.description}</p>
      <p>Status: {revenue?.status}</p>
      <p>Activity Type: {revenue?.activity_type}</p>
      <p>Driver: {revenue?.driver_name}</p>
      <p>Vehicle: {revenue?.vehicle_name}</p>
      {revenue?.proof_of_payment_url && (
        <p>
          Proof of Payment:
          <a href={revenue.proof_of_payment_url} target="_blank" rel="noopener noreferrer">
            View Proof
          </a>
        </p>
      )}
    </div>
  );
}

export default RevenueRecordCard;
