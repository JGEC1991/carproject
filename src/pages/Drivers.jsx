import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import Popout from '../components/Popout'
import DriverRecordCard from '../components/DriverRecordCard'

const Drivers = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [newDriver, setNewDriver] = useState({
    name: '',
    license_number: '',
    phone: '',
    email: '',
    photo_url: '',
    license_image_url: '',
    criminal_records_url: '',
    police_records_url: '',
    national_id_url: '',
    home_address: '',
  })
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('information');

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

  useEffect(() => {
    if (selectedDriver) {
      setNewDriver({
        name: selectedDriver.name || '',
        license_number: selectedDriver.license_number || '',
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        photo_url: selectedDriver.photo_url || '',
        license_image_url: selectedDriver.license_image_url || '',
        criminal_records_url: selectedDriver.criminal_records_url || '',
        police_records_url: selectedDriver.police_records_url || '',
        national_id_url: selectedDriver.national_id_url || '',
        home_address: selectedDriver.home_address || '',
      })
    }
  }, [selectedDriver])

  const handleAddDriverClick = () => {
    setShowAddForm(true)
    setSelectedDriver(null);
    setNewDriver({
        name: '',
        license_number: '',
        phone: '',
        email: '',
        photo_url: '',
        license_image_url: '',
        criminal_records_url: '',
        police_records_url: '',
        national_id_url: '',
        home_address: '',
      });
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setSelectedDriver(null)
  }

  const handleCloseViewForm = () => {
    setShowViewForm(false)
    setSelectedDriver(null)
  }

  const handleInputChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.id]: e.target.value })
  }

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedDriver.id}-${fieldName}.${fileExt}`;
      const filePath = `drivers/${selectedDriver.name}/${fieldName}/${fileName}`;

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

      setNewDriver({ ...newDriver, [fieldName]: publicUrl });

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddDriverSubmit = async (e) => {
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

      // Include the organization_id and user_id in the new driver data
      const newDriverWithOrg = {
        ...newDriver,
        organization_id: organizationId,
      }

      let data, error;

      if (selectedDriver) {
        // Update existing driver
        ({ data, error } = await supabase
          .from('drivers')
          .update(newDriverWithOrg)
          .eq('id', selectedDriver.id)
          .select());
      } else {
        // Insert new driver
        ({ data, error } = await supabase
          .from('drivers')
          .insert([newDriverWithOrg])
          .select());
      }

      if (error) {
        setError(error.message)
        return
      }

      setDrivers([...drivers.filter(d => d.id !== data[0].id), ...data]) // Update or Add the new driver to the list
      setNewDriver({ // Reset the form
        name: '',
        license_number: '',
        phone: '',
        email: '',
        photo_url: '',
        license_image_url: '',
        criminal_records_url: '',
        police_records_url: '',
        national_id_url: '',
        home_address: '',
      })
      setShowAddForm(false) // Hide the form
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver)
    setShowViewForm(true)
    setShowAddForm(false)
  }

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver)
    setShowAddForm(true)
    setShowViewForm(false)
  }

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
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          onClick={handleAddDriverClick}
        >
          Add Driver
        </button>
      </div>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        <h2 className="text-xl font-semibold mb-4">{selectedDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
         <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('information')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'information' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Photos
          </button>
        </div>
        <form onSubmit={handleAddDriverSubmit} className="max-w-lg">
          {activeTab === 'information' && (
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" id="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newDriver.name} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="license_number" className="block text-gray-700 text-sm font-bold mb-2">License Number</label>
                <input type="text" id="license_number" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newDriver.license_number} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                <input type="tel" id="phone" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newDriver.phone} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" id="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newDriver.email} onChange={handleInputChange} />
              </div>
               <div className="mb-4">
                <label htmlFor="home_address" className="block text-gray-700 text-sm font-bold mb-2">Home Address</label>
                <input type="text" id="home_address" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newDriver.home_address} onChange={handleInputChange} />
              </div>
            </div>
          )}
          {activeTab === 'photos' && (
            <div>
              <div className="mb-4">
                <label htmlFor="photo_url" className="block text-gray-700 text-sm font-bold mb-2">Photo</label>
                <input type="file" id="photo_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newDriver.photo_url && <img src={newDriver.photo_url} alt="Profile" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="license_image_url" className="block text-gray-700 text-sm font-bold mb-2">License Image</label>
                <input type="file" id="license_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'license_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newDriver.license_image_url && <img src={newDriver.license_image_url} alt="License" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="criminal_records_url" className="block text-gray-700 text-sm font-bold mb-2">Criminal Records</label>
                <input type="file" id="criminal_records_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'criminal_records_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newDriver.criminal_records_url && <img src={newDriver.criminal_records_url} alt="Criminal Records" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="police_records_url" className="block text-gray-700 text-sm font-bold mb-2">Police Records</label>
                <input type="file" id="police_records_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'police_records_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newDriver.police_records_url && <img src={newDriver.police_records_url} alt="Police Records" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="national_id_url" className="block text-gray-700 text-sm font-bold mb-2">National ID</label>
                <input type="file" id="national_id_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'national_id_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newDriver.national_id_url && <img src={newDriver.national_id_url} alt="National ID" className="mt-2 h-20 w-auto" />}
              </div>
            </div>
          )}
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{selectedDriver ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        <h2 className="text-xl font-semibold mb-4">Detalles de conductor</h2>
        <div>
          <p><strong>Nombre:</strong> {selectedDriver?.name}</p>
          <p><strong>Licencia:</strong> {selectedDriver?.license_number}</p>
          <p><strong>Telefono:</strong> {selectedDriver?.phone}</p>
          <p><strong>Correo Electronico:</strong> {selectedDriver?.email}</p>
          <p><strong>Foto de perfil:</strong></p>
          {selectedDriver?.photo_url && <img src={selectedDriver.photo_url} alt="Profile" className="h-20 w-auto" />}
          <p><strong>Foto de licencia:</strong></p>
          {selectedDriver?.license_image_url && <img src={selectedDriver.license_image_url} alt="License" className="h-20 w-auto" />}
          <p><strong>Antecedentes Penales:</strong></p>
          {selectedDriver?.criminal_records_url && <img src={selectedDriver.criminal_records_url} alt="Criminal Records" className="h-20 w-auto" />}
          <p><strong>Amtecedentes Policiales:</strong></p>
          {selectedDriver?.police_records_url && <img src={selectedDriver.police_records_url} alt="Police Records" className="h-20 w-auto" />}
          <p><strong>Identificacion Nacional:</strong></p>
          {selectedDriver?.national_id_url && <img src={selectedDriver.national_id_url} alt="National ID" className="h-20 w-auto" />}
          <p><strong>Direccion:</strong> {selectedDriver?.home_address}</p>
        </div>
      </Popout>

      <Table
        data={drivers}
        columns={columns}
        onView={handleViewDriver}
        onEdit={handleEditDriver}
        onDelete={handleDeleteDriver}
      />
    </div>
  )
}

export default Drivers
