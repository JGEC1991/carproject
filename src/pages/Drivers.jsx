import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import { Link, useNavigate } from 'react-router-dom';

const Drivers = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [drivers, setDrivers] = useState([])

  const navigate = useNavigate();

  const columns = [
    { key: 'name', title: 'Nombre' },
    { key: 'license_number', title: 'Licencia' },
    { key: 'phone', title: 'Telefono' },
    { key: 'email', title: 'Correo electronico' },
  ]

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')

        if (error) {
          setError(error.message)
          return
        }

        setDrivers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  const handleDeleteDriver = async (driver) => {
    if (window.confirm(`Are you sure you want to delete ${driver.name}?`)) {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', driver.id)

        if (error) {
          setError(error.message)
          return
        }

        setDrivers(drivers.filter((d) => d.id !== driver.id)) // Remove the driver from the list
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <Link
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          to="/drivers/new"
        >
          Agregar conductor
        </Link>
      </div>

      <Table
        data={drivers}
        columns={columns}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteDriver}
        onRowClick={(driver) => navigate(`/drivers/${driver.id}`)}
      />
    </div>
  )
}

export default Drivers
