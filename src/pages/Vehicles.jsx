import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import { Link, useNavigate } from 'react-router-dom';

const Vehicles = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [maintenanceCadence, setMaintenanceCadence] = useState(30);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState({});

  const navigate = useNavigate();

  const columns = [
    { key: 'make', title: 'Marca', sortable: true },
    { key: 'model', title: 'Modelo', sortable: true },
    { key: 'year', title: 'Año', sortable: true },
    { key: 'color', title: 'Color', sortable: true },
    { key: 'license_plate', title: 'Matricula', sortable: true },
    { key: 'vin', title: 'VIN', sortable: true },
    { key: 'status', title: 'Estado', sortable: true },
    { key: 'vehicle_type', title: 'Tipo', sortable: true },
    { key: 'fuel_type', title: 'Combustible', sortable: true },
    { key: 'transmission_type', title: 'Transmision', sortable: true },
    { key: 'insurance_provider', title: 'Aseguradora', sortable: true },
    { key: 'insurance_policy_number', title: 'Poliza', sortable: true },
    { key: 'registration_expiry_date', title: 'Vencimiento', sortable: true },
    { key: 'mantenimiento', title: 'Mantenimiento', sortable: false, render: (vehicle) => maintenanceStatuses[vehicle.id] || "Cargando..." },
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

    const fetchMaintenanceCadence = async () => {
      try {
        // Fetch the maintenance cadence from the organizations table
        const { data: authUser } = await supabase.auth.getUser();
        const userId = authUser.user.id;

        const { data: userData, error: orgError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          setError(orgError.message);
          return;
        }

        const organizationId = userData?.organization_id;

        const { data: orgData, error: orgDataError } = await supabase
          .from('organizations')
          .select('maintenance_cadence_days')
          .eq('id', organizationId)
          .single();

        if (orgDataError) {
          console.error('Error fetching organization data:', orgDataError);
          setError(orgDataError.message);
          return;
        }

        setMaintenanceCadence(orgData?.maintenance_cadence_days || 30);
      } catch (err) {
        console.error('Error fetching maintenance cadence:', err.message);
        setError(err.message);
      }
    };

    fetchVehicles();
    fetchMaintenanceCadence();
  }, [])

  useEffect(() => {
    const calculateAllMaintenanceStatuses = async () => {
      const statuses = {};
      for (const vehicle of vehicles) {
        statuses[vehicle.id] = await calculateMaintenanceStatus(vehicle, maintenanceCadence);
      }
      setMaintenanceStatuses(statuses);
    };

    if (vehicles.length > 0) {
      calculateAllMaintenanceStatuses();
    }
  }, [vehicles, maintenanceCadence]);

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

  const calculateMaintenanceStatus = async (vehicle, maintenanceCadence) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('date')
        .eq('vehicle_id', vehicle.id)
        .eq('activity_type', 'Cambio de aceite')
        .eq('status', 'Completado')
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last oil change:', error);
        return "Error";
      }

      if (!data || data.length === 0) {
        return "No hay registros";
      }

      const lastOilChangeDate = new Date(data[0].date);
      const now = new Date();
      const diffInDays = Math.floor((now - lastOilChangeDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > maintenanceCadence) {
        return "Atrasado";
      } else {
        return "Al dia";
      }
    } catch (err) {
      console.error('Error calculating maintenance status:', err);
      return "Error";
    }
  };

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
