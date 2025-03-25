import React, { useState, useRef, useEffect } from 'react'
    import { supabase } from '../../supabaseClient'
    import { useTranslation } from 'react-i18next';
    
    function DriverRecordCard({ driver }) {
      const [fullName, setFullName] = useState(driver?.full_name || '');
      const [homeAddress, setHomeAddress] = useState(driver?.home_address || '');
      const [phone, setPhone] = useState(driver?.phone || '');
      const [email, setEmail] = useState(driver?.email || '');
      const [driversLicense, setDriversLicense] = useState(null);
      const [policeRecord, setPoliceRecord] = useState(null);
      const [criminalRecord, setCriminalRecord] = useState(null);
      const [profilePhoto, setProfilePhoto] = useState(null);
      const modalRef = useRef(null);
      const { t } = useTranslation('driverRecordCard');
      const [expandedImage, setExpandedImage] = useState(null);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            setExpandedImage(null)
          }
        }
    
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }, [modalRef])
    
      const handleImageUpload = async (e, setImageState, imageUrlField, folder) => {
        const file = e.target.files[0]
        setImageState(file)
    
        try {
          const { data, error } = await supabase.storage
            .from('drivers-photos')
            .upload(`${driver.id}/${folder}/${file.name}`, file, {
              cacheControl: '3600',
              upsert: true,
              public: true,
              contentType: file.type,
            })
    
          if (error) {
            console.error('Error al subir imagen:', error)
            alert(error.message)
            return
          }
    
          const imageUrl = supabase.storage
            .from('drivers-photos')
            .getPublicUrl(`${driver.id}/${folder}/${file.name}`)
            .data.publicUrl
    
          // Update the driver record in the database with the new image URL
          const { error: updateError } = await supabase
            .from('drivers')
            .update({ [imageUrlField]: imageUrl })
            .eq('id', driver.id)
    
          if (updateError) {
            console.error('Error al actualizar el registro:', updateError)
            alert(updateError.message)
          } else {
            alert('La imagen y el registro se actualizaron exitosamente!')
            // Refresh the driver data to display the new image
            window.location.reload()
          }
        } catch (error) {
          console.error('Error uploading image:', error.message)
          alert(error.message)
        }
      }
    
      const handleExpandImage = (imageUrl) => {
        setExpandedImage(imageUrl)
      }
    
      const handleCloseExpandedImage = () => {
        setExpandedImage(null)
      }
    
      const handleDownloadImage = (imageUrl) => {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `driver_image_${Date.now()}` // Suggest a filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    
      const handleSave = async () => {
        try {
          const { data, error } = await supabase
            .from('drivers')
            .update({
              full_name: fullName,
              home_address: homeAddress,
              phone: phone,
              email: email,
            })
            .eq('id', driver.id)
    
          if (error) {
            console.error('Error updating driver:', error)
            alert(error.message)
          } else {
            console.log('Driver updated:', data)
            alert('Registro actualizado!')
          }
        } catch (error) {
          console.error('Error updating driver:', error.message)
          alert(error.message)
        }
      }
    
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalles de Conductor</h2>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <label className="block text-sm font-medium text-gray-700">Direccion</label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <label className="block text-sm font-medium text-gray-700">Telefono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <label className="block text-sm font-medium text-gray-700">Correo Electronico</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
    
          <hr className="my-6 border-gray-300" />
    
          <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">Fotos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {driver?.drivers_license_photo && (
              <div>
                <img
                  src={driver.drivers_license_photo}
                  alt="Driver's License"
                  className="object-cover w-32 h-32 rounded-md shadow-md cursor-pointer"
                  onClick={() => handleExpandImage(driver.drivers_license_photo)}
                />
              </div>
            )}
            {driver?.police_records_photo && (
              <div>
                <img
                  src={driver.police_records_photo}
                  alt="Police Record"
                  className="object-cover w-32 h-32 rounded-md shadow-md cursor-pointer"
                  onClick={() => handleExpandImage(driver.police_records_photo)}
                />
              </div>
            )}
            {driver?.criminal_records_photo && (
              <div>
                <img
                  src={driver.criminal_records_photo}
                  alt="Criminal Record"
                  className="object-cover w-32 h-32 rounded-md shadow-md cursor-pointer"
                  onClick={() => handleExpandImage(driver.criminal_records_photo)}
                />
              </div>
            )}
            {driver?.profile_photo && (
              <div>
                <img
                  src={driver.profile_photo}
                  alt="Profile"
                  className="object-cover w-32 h-32 rounded-md shadow-md cursor-pointer"
                  onClick={() => handleExpandImage(driver.profile_photo)}
                />
              </div>
            )}
          </div>
    
          {expandedImage && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50" onClick={handleCloseExpandedImage}>
              <div className="relative" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <img src={expandedImage} alt="Expanded" className="max-w-4xl max-h-4xl rounded-lg" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
                <button onClick={handleCloseExpandedImage} className="absolute top-4 right-4 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
           <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
            >
              Guardar
            </button>
          </div>
        </div>
      )
    }
    
    export default DriverRecordCard
