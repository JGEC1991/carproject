import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import ExpenseRecordCard from '../../../src/components/ExpenseRecordCard';

function ExpenseRecord() {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching expense:', error);
          alert(error.message);
        } else {
          setExpense(data);
        }
      } catch (error) {
        console.error('Error fetching expense:', error.message);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  if (loading) {
    return <div className="page">Cargando detalles...</div>;
  }

  if (!expense) {
    return <div className="page">No se encontraron gastos.</div>;
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Detalles de gasto</h1>
      <ExpenseRecordCard expense={expense} />
      <Link to="/expenses" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Regresar a gastos</Link>
    </div>
  );
}

export default ExpenseRecord;
