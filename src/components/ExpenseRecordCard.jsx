import React from 'react';

function ExpenseRecordCard({ expense }) {
  return (
    <div>
      <h2>Expense Details</h2>
      <p>Date: {expense?.date}</p>
      <p>Amount: {expense?.amount}</p>
      <p>Description: {expense?.description}</p>
      <p>Status: {expense?.status}</p>
      <p>Activity Type: {expense?.activity_type}</p>
      <p>Driver: {expense?.driver_name}</p>
      <p>Vehicle: {expense?.vehicle_name}</p>
      {expense?.attachment_file && (
        <p>
          Proof of Payment:
          <a href={expense.attachment_file} target="_blank" rel="noopener noreferrer">
            View Proof
          </a>
        </p>
      )}
    </div>
  );
}

export default ExpenseRecordCard;
