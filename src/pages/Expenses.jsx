import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import { Link, useNavigate } from 'react-router-dom';

const Expenses = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expenses, setExpenses] = useState([])

  const navigate = useNavigate();

  const columns = [
    { key: 'date', title: 'Fecha' },
    { key: 'amount', title: 'Cantidad' },
    { key: 'description', title: 'Descripcion' },
    { key: 'status', title: 'Estado' },
    { key: 'activity_type', title: 'Tipo de actividad' },
    { key: 'driver_name', title: 'Conductor' },
    { key: 'vehicle_name', title: 'Vehiculo' },
  ]

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('expenses')
          .select(`
            *,
            activities (activity_type, description),
            drivers (name),
            vehicles (make, model, license_plate)
          `)

        if (error) {
          setError(error.message)
          return
        }

        // Process the data to include readable names
        const processedExpenses = data.map(item => ({
          ...item,
          activity_type: item.activities ? item.activities.activity_type : 'N/A',
          driver_name: item.drivers ? item.drivers.name : 'N/A',
          vehicle_name: item.vehicles ? `${item.vehicles.make} ${item.vehicles.model} (${item.vehicles.license_plate})` : 'N/A',
        }));

        console.log("Retrieved Expenses Data:", processedExpenses);
        setExpenses(processedExpenses)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const handleDeleteExpense = async (expense) => {
    if (window.confirm(`Are you sure you want to delete this expense record?`)) {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id)

        if (error) {
          setError(error.message)
          return
        }

        setExpenses(expenses.filter((e) => e.id !== expense.id)) // Remove the expense from the list
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <Link
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          to="/expenses/new"
        >
          Agregar un gasto
        </Link>
      </div>

      <Table
        data={expenses}
        columns={columns}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteExpense}
        onRowClick={(expense) => navigate(`/expenses/${expense.id}`)}
      />
    </div>
  )
}

export default Expenses
