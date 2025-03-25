import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Table from '../components/Table'
import Popout from '../components/Popout'
import RevenueRecordCard from '../components/RevenueRecordCard'

const Vehicles = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    vin: '',
    status: 'disponible',
    front_image_url: '',
    rear_image_url: '',
    right_image_url: '',
    left_image_url: '',
    dashboard_image_url: '',
    observations: '',
  })
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('information');

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

  useEffect(() => {
    if (selectedVehicle) {
      setNewVehicle({
        make: selectedVehicle.make || '',
        model: selectedVehicle.model || '',
        year: selectedVehicle.year || '',
        color: selectedVehicle.color || '',
        license_plate: selectedVehicle.license_plate || '',
        vin: selectedVehicle.vin || '',
        status: selectedVehicle.status || 'disponible',
        front_image_url: selectedVehicle.front_image_url || '',
        rear_image_url: selectedVehicle.rear_image_url || '',
        right_image_url: selectedVehicle.right_image_url || '',
        left_image_url: selectedVehicle.left_image_url || '',
        dashboard_image_url: selectedVehicle.dashboard_image_url || '',
        observations: selectedVehicle.observations || '',
      })
    }
  }, [selectedVehicle])

  const handleAddVehicleClick = () => {
    setShowAddForm(true)
    setSelectedVehicle(null);
    setNewVehicle({  // Reset the form
        make: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        vin: '',
        status: 'disponible',
        front_image_url: '',
        rear_image_url: '',
        right_image_url: '',
        left_image_url: '',
        dashboard_image_url: '',
        observations: '',
      });
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
    setSelectedVehicle(null)
  }

  const handleCloseViewForm = () => {
    setShowViewForm(false)
    setSelectedVehicle(null)
  }

  const handleInputChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.id]: e.target.value })
  }

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Get file creation date (using lastModified for compatibility)
    const fileCreationDate = new Date(file.lastModified);
    const currentDate = new Date();

    // Compare dates (ignoring time)
    if (
      fileCreationDate.getFullYear() !== currentDate.getFullYear() ||
      fileCreationDate.getMonth() !== currentDate.getMonth() ||
      fileCreationDate.getDate() !== currentDate.getDate()
    ) {
      setError(`The file is not from today. File creation date: ${fileCreationDate.toLocaleDateString()}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedVehicle.id}-${fieldName}.${fileExt}`;
      const filePath = `vehicles/${selectedVehicle.year}/${selectedVehicle.month}/${fieldName}/${fileName}`;

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

      setNewVehicle({ ...newVehicle, [fieldName]: publicUrl });

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddVehicleSubmit = async (e) => {
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

      // Include the organization_id in the new vehicle data
      const newVehicleWithOrg = {
        ...newVehicle,
        organization_id: organizationId,
      }

      let data, error;

      if (selectedVehicle) {
        // Update existing vehicle
        ({ data, error } = await supabase
          .from('vehicles')
          .update(newVehicleWithOrg)
          .eq('id', selectedVehicle.id)
          .select());
      } else {
        // Insert new vehicle
        ({ data, error } = await supabase
          .from('vehicles')
          .insert([newVehicleWithOrg])
          .select());
      }

      if (error) {
        setError(error.message)
        return
      }

      setVehicles([...vehicles.filter(v => v.id !== data[0].id), ...data]) // Update or Add the new vehicle to the list
      setNewVehicle({ // Reset the form
        make: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        vin: '',
        status: 'disponible',
        front_image_url: '',
        rear_image_url: '',
        right_image_url: '',
        left_image_url: '',
        dashboard_image_url: '',
        observations: '',
      })
      setShowAddForm(false) // Hide the form
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowViewForm(true)
    setShowAddForm(false)
  }

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowAddForm(true)
    setShowViewForm(false)
  }

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
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
          onClick={handleAddVehicleClick}
        >
          Agregar vehiculo
        </button>
      </div>

      <Popout isOpen={showAddForm} onClose={handleCloseAddForm}>
        <h2 className="text-xl font-semibold mb-4">{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
         <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('information')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'information' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Informacion
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Fotos
          </button>
        </div>
        <form onSubmit={handleAddVehicleSubmit} className="max-w-lg">
          {activeTab === 'information' && (
            <div>
              <div className="mb-4">
                <label htmlFor="make" className="block text-gray-700 text-sm font-bold mb-2">Marca</label>
                <input type="text" id="make" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.make} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Modelo</label>
                <input type="text" id="model" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.model} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Año</label>
                <input type="number" id="year" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.year} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="color" className="block text-gray-700 text-sm font-bold mb-2">Color</label>
                <input type="text" id="color" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.color} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="license_plate" className="block text-gray-700 text-sm font-bold mb-2">Matricula</label>
                <input type="text" id="license_plate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.license_plate} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="vin" className="block text-gray-700 text-sm font-bold mb-2">Vin</label>
                <input type="text" id="vin" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.vin} onChange={handleInputChange} />
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
                <select id="status" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.status} onChange={handleInputChange}>
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">Observaciones</label>
                <textarea id="observations" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newVehicle.observations} onChange={handleInputChange} />
              </div>
            </div>
          )}
          {activeTab === 'photos' && (
            <div>
              <div className="mb-4">
                <label htmlFor="front_image_url" className="block text-gray-700 text-sm font-bold mb-2">Imagen Frontal</label>
                <input type="file" id="front_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'front_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newVehicle.front_image_url && <img src={newVehicle.front_image_url} alt="Front" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="rear_image_url" className="block text-gray-700 text-sm font-bold mb-2">Imagen Trasera</label>
                <input type="file" id="rear_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'rear_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newVehicle.rear_image_url && <img src={newVehicle.rear_image_url} alt="Rear" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="right_image_url" className="block text-gray-700 text-sm font-bold mb-2">Imagen Lateral Derecha</label>
                <input type="file" id="right_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'right_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newVehicle.right_image_url && <img src={newVehicle.right_image_url} alt="Right" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="left_image_url" className="block text-gray-700 text-sm font-bold mb-2">Imagen Lateral Izquierda</label>
                <input type="file" id="left_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'left_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newVehicle.left_image_url && <img src={newVehicle.left_image_url} alt="Left" className="mt-2 h-20 w-auto" />}
              </div>
              <div className="mb-4">
                <label htmlFor="dashboard_image_url" className="block text-gray-700 text-sm font-bold mb-2">Imagen de Tablero</label>
                <input type="file" id="dashboard_image_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'dashboard_image_url')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {newVehicle.dashboard_image_url && <img src={newVehicle.dashboard_image_url} alt="Dashboard" className="mt-2 h-20 w-auto" />}
              </div>
            </div>
          )}
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{selectedVehicle ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Popout>

      <Popout isOpen={showViewForm} onClose={handleCloseViewForm}>
        <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
        <div>
          <p><strong>Marca:</strong> {selectedVehicle?.make}</p>
          <p><strong>Modelo:</strong> {selectedVehicle?.model}</p>
          <p><strong>Año:</strong> {selectedVehicle?.year}</p>
          <p><strong>Color:</strong> {selectedVehicle?.color}</p>
          <p><strong>Matricula:</strong> {selectedVehicle?.license_plate}</p>
          <p><strong>Vin:</strong> {selectedVehicle?.vin}</p>
          <p><strong>Estado:</strong> {selectedVehicle?.status}</p>
          <p><strong>Imagen Frontal:</strong></p>
          {selectedVehicle?.front_image_url && <img src={selectedVehicle.front_image_url} alt="Front" className="h-20 w-auto" />}
          <p><strong>Imagen Trasera:</strong></p>
          {selectedVehicle?.rear_image_url && <img src={selectedVehicle.rear_image_url} alt="Rear" className="h-20 w-auto" />}
          <p><strong>Imagen Derecha:</strong></p>
          {selectedVehicle?.right_image_url && <img src={selectedVehicle.right_image_url} alt="Right" className="h-20 w-auto" />}
          <p><strong>Imagen Izquierda:</strong></p>
          {selectedVehicle?.left_image_url && <img src={selectedVehicle.left_image_url} alt="Left" className="h-20 w-auto" />}
          <p><strong>Imagen de Tablero:</strong></p>
          {selectedVehicle?.dashboard_image_url && <img src={selectedVehicle.dashboard_image_url} alt="Dashboard" className="h-20 w-auto" />}
          <p><strong>Observaciones:</strong> {selectedVehicle?.observations}</p>
        </div>
      </Popout>

      <Table
        data={vehicles}
        columns={columns}
        onView={handleViewVehicle}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />
    </div>
  )
}

export default Vehicles
