import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import Popout from '../components/Popout'
import ActivityRecordCard from '../components/ActivityRecordCard'

const Activities = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activities, setActivities] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [newActivity, setNewActivity] = useState({
    date: '',
    description: '',
    activity_type: '',
    vehicle_id: '',
    driver_id: '',
    status: 'Pending',
  })
  const [newAttachments, setNewAttachments] = useState('')
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [uploading, setUploading] = useState(false);

  const activityTypes = [
    'Maintenance',
    'Cleaning',
    'Repair',
    'Oil Change',
    'Driver\'s Daily Payment',
    'Flat Tire',
    'Towing',
    'Other',
  ]

  const columns = [
    { key: 'date', title: 'Date' },
    { key: 'description', title: 'Description' },
    { key: 'activity_type', title: 'Activity Type' },
    { key: 'vehicle_name', title: 'Vehicle' },
    { key: 'driver_name', title: 'Driver' },
    { key: 'status', title: 'Status' },
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

    const fetchVehicles = async () => {
      try {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, make, model') // Fetch only necessary data

        if (vehicleError) {
          console.error('Error fetching vehicles:', vehicleError)
          return
        }

        setVehicles(vehicleData)
      } catch (err) {
        console.error('Error fetching vehicles:', err)
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

    fetchActivities()
    fetchVehicles()
    fetchDrivers()
  }, [])

  const handleAddActivityClick = () => {
    setShowAddForm(true)
    setSelectedActivity(null);
    setNewActivity({
      date: '',
      description: '',
      activity_type: activityTypes[0], // Set default value
      vehicle_id: '',
      driver_id: '',
      status: 'Pending',
    })
    setNewAttachments('')
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setSelectedActivity(null)
    setNewAttachments('')
  }

  const handleCloseViewForm = () => {
    setShowViewForm(false)
    setSelectedActivity(null)
  }

  const handleInputChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.id]: e.target.value })
  }

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `activities/${newActivity.date.substring(0, 4)}/${newActivity.date.substring(5, 7)}/attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('jerentcars-storage')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          setError(uploadError.message);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from('jerentcars-storage')
          .getPublicUrl(filePath)

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setNewAttachments(validUrls.length > 0 ? validUrls[0] : '');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddActivitySubmit = async (e) => {
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

      console.log("Organization ID:", organizationId);

      // Include the organization_id in the new activity data
      const newActivityWithOrg = {
        ...newActivity,
        organization_id: organizationId,
        attachment_url: newAttachments,
      }

      console.log("New Activity with Org:", newActivityWithOrg);

      let data, error;

      if (selectedActivity) {
        // Update existing activity
        ({ data, error } = await supabase
          .from('activities')
          .update(newActivityWithOrg)
          .eq('id', selectedActivity.id)
          .select());
      } else {
        // Insert new activity
        ({ data, error } = await supabase
          .from('activities')
          .insert([newActivityWithOrg])
          .select());
      }

      if (error) {
        setError(error.message)
        return
      }

      setActivities([...activities.filter(a => a.id !== data[0].id), ...data]) // Update or Add the new activity to the list
      setNewActivity({ // Reset the form
        date: '',
        description: '',
        activity_type: activityTypes[0], // Set default value
        vehicle_id: '',
        driver_id: '',
        status: 'Pending',
      })
      setNewAttachments('')
      setShowAddForm(false) // Hide the form
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity)
    setShowViewForm(true)
    setShowAddForm(false)
  }

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity)
    setShowAddForm(true)
    setShowViewForm(false)
    setNewActivity({
      date: activity.date || '',
      description: activity.description || '',
      activity_type: activity.activity_type || '',
      vehicle_id: activity.vehicle_id || '',
      driver_id: activity.driver_id || '',
      status: activity.status || 'Pending',
    });
    setNewAttachments(activity.attachment_url || '');
  }

  const handleDeleteActivity = async (activity) => {
    if (window.confirm(`Are you sure you want to delete this activity?`)) {
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', activity.id)

        if (error) {
          setError(error.message)
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
          onClick={handleAddActivityClick}
        >
          {selectedActivity ? 'Edit Activity' : 'Add Activity'}
        </button>
      </div>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        <h2 className="text-xl font-semibold mb-4">{selectedActivity ? 'Edit Activity' : 'Add New Activity'}</h2>
        <form onSubmit={handleAddActivitySubmit} className="max-w-lg">
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
            <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.date} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.description} onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="activity_type" className="block text-gray-700 text-sm font-bold mb-2">Activity Type</label>
            <select
              id="activity_type"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newActivity.activity_type}
              onChange={handleInputChange}
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="vehicle_id" className="block text-gray-700 text-sm font-bold mb-2">Vehicle</label>
            <select id="vehicle_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.vehicle_id} onChange={handleInputChange}>
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} - {vehicle.model}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="driver_id" className="block text-gray-700 text-sm font-bold mb-2">Driver</label>
            <select id="driver_id" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.driver_id} onChange={handleInputChange}>
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
           <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select id="status" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newActivity.status} onChange={handleInputChange}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Past due">Past Due</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="attachments" className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
            <input
              type="file"
              id="attachments"
              multiple
              accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleAttachmentUpload}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {selectedActivity ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        {selectedActivity && <ActivityRecordCard activity={selectedActivity} />}
      </Popout>

      <Table
        data={activities}
        columns={columns}
        onView={handleViewActivity}
        onEdit={handleEditActivity}
        onDelete={handleDeleteActivity}
      />
    </div>
  )
}

export default Activities
