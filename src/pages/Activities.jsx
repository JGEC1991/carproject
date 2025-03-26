import { useState, useEffect } from 'react'
    import { supabase } from '../supabaseClient'
    import Table from '../components/Table'
    import { Link, useNavigate } from 'react-router-dom';

    const Activities = () => {
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [activities, setActivities] = useState([])

      const navigate = useNavigate();

      const columns = [
        { key: 'date', title: 'Fecha' },
        { key: 'description', title: 'Descripcion' },
        { key: 'activity_type', title: 'Tipo de actividad' },
        { key: 'vehicle_name', title: 'Vehiculo' },
        { key: 'driver_name', title: 'Conductor' },
        { key: 'status', title: 'Estado' },
      ]

      useEffect(() => {
        const fetchActivities = async () => {
          setLoading(true)
          setError(null)

          try {
            const { data, error } = await supabase
              .from('activities')
              .select('*, vehicles(make, model, license_plate), drivers(name)')
              .order('date', { ascending: false });

            if (error) {
              setError(error.message)
              return
            }

            // Process the data to include driver and vehicle names
            const processedActivities = data.map(activity => ({
              ...activity,
              vehicle_name: activity.vehicles ? `${activity.vehicles.make} ${activity.vehicles.model} (${activity.vehicles.license_plate})` : 'N/A',
              driver_name: activity.drivers ? activity.drivers.name : 'N/A',
            }));

            setActivities(processedActivities)
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchActivities()
      }, [])

      const handleDeleteActivity = async (activity) => {
        if (window.confirm(`Aun quieres borrar la actividad?`)) {
          setLoading(true)
          setError(null)

          try {
            const { error } = await supabase
              .from('activities')
              .delete()
              .eq('id', activity.id)

            if (error) {
              if (error.code === '23503') {
                setError("La actividad no se puede borrar por que esta asociada con otro registro.");
              } else {
                setError(error.message);
              }
              return
            }

            setActivities(activities.filter((a) => a.id !== activity.id)) // Remove the activity from the list
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
              to="/activities/new"
            >
              Agregar actividad
            </Link>
          </div>

          <Table
            data={activities}
            columns={columns}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={handleDeleteActivity}
            onRowClick={(activity) => navigate(`/activities/${activity.id}`)}
          />
        </div>
      )
    }

    export default Activities
