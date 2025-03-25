import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import { Link, useNavigate } from 'react-router-dom';

const Vehicles = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicles, setVehicles] = useState([])

  const navigate = useNavigate();

  const columns = [
    { key: 'make', title: 'Marca' },
    { key: 'model', title: 'Modelo' },
    { key: 'year', title: 'Año' },
    { key: 'color', title: 'Color' },
    { key: 'license_plate', title: 'Matricula' },
    { key: 'vin', title: 'VIN' },
    { key: 'status', title: 'Estado' },
  ]

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')

        if (error) {
          setError(error.message)
          return
        }

        setVehicles(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Seguro que desea eliminar el ${vehicle.make} ${vehicle.model}?`)) {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id)

        if (error) {
          setError(error.message)
          return
        }

        setVehicles(vehicles.filter((v) => v.id !== vehicle.id)) // Remove the vehicle from the list
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
          to="/vehicles/new"
        >
          Agregar vehiculo
        </Link>
      </div>

      <Table
        data={vehicles}
        columns={columns}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={handleDeleteVehicle}
        onRowClick={(vehicle) => navigate(`/vehicles/${vehicle.id}`)}
      />
    </div>
  )
}

export default Vehicles
