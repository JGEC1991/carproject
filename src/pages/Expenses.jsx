import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import Popout from '../components/Popout'
import ExpenseRecordCard from '../components/ExpenseRecordCard'

const Expenses = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [newExpense, setNewExpense] = useState({
    date: '',
    amount: '',
    description: '',
    status: 'Pendiente',
    activity_id: '',
    driver_id: '',
    vehicle_id: '',
    attachment_file: '',
  })
  const [activities, setActivities] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [attachmentFile, setAttachmentFile] = useState(null);

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

    const fetchActivities = async () => {
      try {
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('id, description') // Fetch only necessary data

        if (activityError) {
          console.error('Error fetching activities:', activityError)
          return
        }

        setActivities(activityData)
      } catch (err) {
        console.error('Error fetching activities:', err)
      }
    }

    const fetchDrivers = async () => {
      try {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('id, name') // Fetch only necessary data

        if (driverError) {
          console.error('Error fetching drivers:', driverError)
          return
        }

        setDrivers(driverData)
      } catch (err) {
        console.error('Error fetching drivers:', err)
      }
    }

    const fetchVehicles = async () => {
      try {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, make, model, license_plate') // Fetch only necessary data

        if (vehicleError) {
          console.error('Error fetching vehicles:', vehicleError)
          return
        }

        setVehicles(vehicleData)
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      }
    }

    fetchExpenses()
    fetchActivities()
    fetchDrivers()
    fetchVehicles()
  }, [])

  const handleAddExpenseClick = () => {
    setShowAddForm(true)
    setSelectedExpense(null);
    setNewExpense({
      date: '',
      amount: '',
      description: '',
      status: 'Pendiente',
      activity_id: '',
      driver_id: '',
      vehicle_id: '',
      attachment_file: '',
    })
    setAttachmentFile(null);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setSelectedExpense(null)
    setAttachmentFile(null);
  }

  const handleInputChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.id]: e.target.value })
  }

  const handleProofOfPaymentUpload = async (e) => {
    const file = e.target.files[0];
    setAttachmentFile(file);

    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-proof_of_payment.${fileExt}`;
      const filePath = `expenses/${newExpense.date.substring(0, 4)}/${newExpense.date.substring(5, 7)}/proof_of_payment/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('jerentcars-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('jerentcars-storage')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl;

      setNewExpense({ ...newExpense, attachment_file: publicUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get the user's organization ID
      const { data: authUser, error: authError } = await supabase.auth.getUser()

      if (authError) {
        setError(authError.message)
        return
      }

      const userId = authUser.user.id

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      if (orgError) {
        setError(orgError.message)
        return
      }

      const organizationId = userData?.organization_id

      if (!organizationId) {
        setError('Unable to determine organization ID.')
        return
      }

      // Include the organization_id in the new expense data
      const newExpenseWithOrg = {
        ...newExpense,
        organization_id: organizationId,
      }

      let data, error;

      if (selectedExpense) {
        // Update existing expense
        ({ data, error } = await supabase
          .from('expenses')
          .update(newExpenseWithOrg)
          .eq('id', selectedExpense.id)
          .select());
      } else {
        // Insert new expense
        ({ data, error } = await supabase
          .from('expenses')
          .insert([newExpenseWithOrg])
          .select());
      }

      if (error) {
        setError(error.message)
        return
      }

      setExpenses(prevExpenses => {
        if (selectedExpense) {
          // Update existing expense
          return prevExpenses.map(item => (item.id === selectedExpense.id ? data[0] : item));
        } else {
          // Insert new expense
          return [...prevExpenses, data[0]];
        }
      });
      setNewExpense({ // Reset the form
        date: '',
        amount: '',
        description: '',
        status: 'Pendiente',
        activity_id: '',
        driver_id: '',
        vehicle_id: '',
        attachment_file: '',
      });
      setAttachmentFile(null);
      setShowAddForm(false) // Hide the form
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense)
    setShowViewForm(true)
    setShowAddForm(false)
  }

  const handleEditExpense = async (expense) => {
    setSelectedExpense(expense)
    setShowAddForm(true)
    setShowViewForm(false)
    setNewExpense({
      date: expense.date || '',
      amount: expense.amount || '',
      description: expense.description || '',
      status: expense.status || 'Pendiente',
      activity_id: expense.activity_id || '',
      driver_id: expense.driver_id || '',
      vehicle_id: expense.vehicle_id || '',
      attachment_file: expense.attachment_file || '',
    });
    setAttachmentFile(null);
  }

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

  const handleCloseViewForm = () => {
    setShowViewForm(false)
    setSelectedExpense(null)
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
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          onClick={handleAddExpenseClick}
        >
          Agregar un gasto
        </button>
      </div>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        <h2 className="text-xl font-semibold mb-4">{selectedExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleAddExpenseSubmit} className="max-w-lg">
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
            <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.date} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Cantidad</label>
            <input type="number" id="amount" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.amount} onChange={handleInputChange} placeholder="Enter expense amount" />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descripcion</label>
            <textarea id="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.description} onChange={handleInputChange} placeholder="Enter description" />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
            <select id="status" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.status} onChange={handleInputChange}>
              <option value="Pending">Pendiente</option>
              <option value="Paid">Pagado</option>
              <option value="Canceled">Cancelado</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="activity_id" className="block text-gray-700 text-sm font-bold mb-2">Actividad</label>
            <select id="activity_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.activity_id} onChange={handleInputChange}>
              <option value="">Selecciona una actividad</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>{activity.description}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
            <select id="driver_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.driver_id} onChange={handleInputChange}>
              <option value="">Selecciona un conductor</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
            <select id="vehicle_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newExpense.vehicle_id} onChange={handleInputChange}>
              <option value="">Selecciona un vehiculo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} - {vehicle.model}</option>
              ))}
            </select>
          </div>
           <div className="mb-4">
            <label htmlFor="attachment_file" className="block text-gray-700 text-sm font-bold mb-2">Recibo/Factura</label>
            <input
              type="file"
              id="attachment_file"
              accept="image/*, application/pdf"
              onChange={handleProofOfPaymentUpload}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {newExpense.attachment_file && <a href={newExpense.attachment_file} target="_blank" rel="noopener noreferrer">Ver archivo</a>}
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {selectedExpense ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        {selectedExpense && <ExpenseRecordCard expense={selectedExpense} />}
      </Popout>

      <Table
        data={expenses}
        columns={columns}
        onView={handleViewExpense}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
    </div>
  )
}

export default Expenses
