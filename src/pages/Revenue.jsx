import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import { Link, useNavigate } from 'react-router-dom';

const Revenue = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revenue, setRevenue] = useState([])

  const navigate = useNavigate();

  const columns = [
    { key: 'date', title: 'Fecha' },
    { key: 'amount', title: 'Cantidad' },
    { key: 'description', title: 'Descripcion' },
    { key: 'status', title: 'Estado' },
    { key: 'activity_type', title: 'Actividad' },
    { key: 'driver_name', title: 'Conductor' },
    { key: 'vehicle_name', title: 'Vehiculo' },
  ]

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('revenue')
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
        const processedRevenue = data.map(item => ({
          ...item,
          activity_type: item.activities ? item.activities.activity_type : 'N/A',
          driver_name: item.drivers ? item.drivers.name : 'N/A',
          vehicle_name: item.vehicles ? `${item.vehicles.make} ${item.vehicles.model} (${item.vehicles.license_plate})` : 'N/A',
        }));

        console.log("Retrieved Revenue Data:", processedRevenue);
        setRevenue(processedRevenue)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [])

  const handleDeleteRevenue = async (revenue) => {
    if (window.confirm(`Seguro que deseas borrar este registro?`)) {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase
          .from('revenue')
          .delete()
          .eq('id', revenue.id)

        if (error) {
          setError(error.message)
          return
        }

        setRevenue(prevRevenue => {
          if (Array.isArray(prevRevenue)) {
            return prevRevenue.filter((r) => r.id !== revenue.id)
          } else {
            console.error('prevRevenue is not an array:', prevRevenue);
            return [];
          }
        }) // Remove the revenue from the list
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
          to="/revenue/new"
        >
          Agregar un ingreso
        </Link>
      </div>

      <Table
        data={revenue}
        columns={columns}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteRevenue}
        onRowClick={(revenue) => navigate(`/revenue/${revenue.id}`)}
      />
    </div>
  )
}

export default Revenue
