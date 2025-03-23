import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import Popout from '../components/Popout'
import RevenueRecordCard from '../components/RevenueRecordCard'

const Revenue = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedRevenue, setSelectedRevenue] = useState(null)
  const [newRevenue, setNewRevenue] = useState({
    date: '',
    amount: '',
    description: '',
    status: 'complete',
    activity_id: '',
    driver_id: '',
    vehicle_id: '',
    proof_of_payment_url: '',
  })
  const [activities, setActivities] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [proofOfPayment, setProofOfPayment] = useState(null);

  const columns = [
    { key: 'date', title: 'Date' },
    { key: 'amount', title: 'Amount' },
    { key: 'description', title: 'Description' },
    { key: 'status', title: 'Status' },
    { key: 'activity_type', title: 'Activity' },
    { key: 'driver_name', title: 'Driver' },
    { key: 'vehicle_name', title: 'Vehicle' },
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

    fetchRevenue()
    fetchActivities()
    fetchDrivers()
    fetchVehicles()
  }, [])

  const handleAddRevenueClick = () => {
    setShowAddForm(true)
    setSelectedRevenue(null);
    setNewRevenue({
      date: '',
      amount: '',
      description: '',
      status: 'complete',
      activity_id: '',
      driver_id: '',
      vehicle_id: '',
      proof_of_payment_url: '',
    })
    setProofOfPayment(null);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setSelectedRevenue(null)
    setProofOfPayment(null);
  }

  const handleInputChange = (e) => {
    setNewRevenue({ ...newRevenue, [e.target.id]: e.target.value })
  }

  const handleProofOfPaymentUpload = async (e) => {
    const file = e.target.files[0];
    setProofOfPayment(file);

    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-proof_of_payment.${fileExt}`;
      const filePath = `revenue/${newRevenue.date.substring(0, 4)}/${newRevenue.date.substring(5, 7)}/proof_of_payment/${fileName}`;

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

      setNewRevenue({ ...newRevenue, proof_of_payment_url: publicUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevenueSubmit = async (e) => {
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

      // Include the organization_id in the new revenue data
      const newRevenueWithOrg = {
        ...newRevenue,
        organization_id: organizationId,
      }

      let data, error;

      if (selectedRevenue) {
        // Update existing revenue
        ({ data, error } = await supabase
          .from('revenue')
          .update(newRevenueWithOrg)
          .eq('id', selectedRevenue.id)
          .select());
      } else {
        // Insert new revenue
        ({ data, error } = await supabase
          .from('revenue')
          .insert([newRevenueWithOrg])
          .select());
      }

      if (error) {
        setError(error.message)
        return
      }

      setRevenue(prevRevenue => {
        if (Array.isArray(prevRevenue)) {
          return prevRevenue.map(item => (item.id === selectedRevenue.id ? data[0] : item));
        } else {
          console.error('prevRevenue is not an array:', prevRevenue);
          return [];
        }
      });
      setNewRevenue({ // Reset the form
        date: '',
        amount: '',
        description: '',
        status: 'complete',
        activity_id: '',
        driver_id: '',
        vehicle_id: '',
        proof_of_payment_url: '',
      });
      setProofOfPayment(null);
      setShowAddForm(false) // Hide the form
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewRevenue = (revenue) => {
    setSelectedRevenue(revenue);
    setShowViewForm(true);
    setShowAddForm(false);
  };

  const handleEditRevenue = (revenue) => {
    setSelectedRevenue(revenue);
    setShowAddForm(true);
    setShowViewForm(false);
    setNewRevenue({
      date: revenue.date || '',
      amount: revenue.amount || '',
      description: revenue.description || '',
      status: revenue.status || 'complete',
      activity_id: revenue.activity_id || '',
      driver_id: revenue.driver_id || '',
      vehicle_id: revenue.vehicle_id || '',
      proof_of_payment_url: revenue.proof_of_payment_url || '',
    });
    setProofOfPayment(null);
  };

  const handleDeleteRevenue = async (revenue) => {
    if (window.confirm(`Are you sure you want to delete this revenue record?`)) {
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

  const handleCloseViewForm = () => {
    setShowViewForm(false)
    setSelectedRevenue(null)
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
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          onClick={handleAddRevenueClick}
        >
          Add Revenue
        </button>
      </div>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        <h2 className="text-xl font-semibold mb-4">Add New Revenue</h2>
        <form onSubmit={handleAddRevenueSubmit} className="max-w-lg">
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
            <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.date} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
            <input type="number" id="amount" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.amount} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.description} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select id="status" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.status} onChange={handleInputChange}>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="pastdue">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="activity_id" className="block text-gray-700 text-sm font-bold mb-2">Activity</label>
            <select id="activity_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.activity_id} onChange={handleInputChange}>
              <option value="">Select Activity</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>{activity.description}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
            <select id="driver_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.driver_id} onChange={handleInputChange}>
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
            <select id="vehicle_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newRevenue.vehicle_id} onChange={handleInputChange}>
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} - {vehicle.model}</option>
              ))}
            </select>
          </div>
           <div className="mb-4">
            <label htmlFor="proof_of_payment_url" className="block text-gray-700 text-sm font-bold mb-2">Proof of Payment</label>
            <input
              type="file"
              id="proof_of_payment_url"
              accept="image/*, application/pdf"
              onChange={handleProofOfPaymentUpload}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {selectedRevenue ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        {selectedRevenue && <RevenueRecordCard revenue={selectedRevenue} />}
      </Popout>

      <Table
        data={revenue}
        columns={columns}
        onView={handleViewRevenue}
        onEdit={handleEditRevenue}
        onDelete={handleDeleteRevenue}
      />
    </div>
  )
}

export default Revenue
