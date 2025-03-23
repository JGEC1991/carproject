import React, { useState, useRef, useEffect } from 'react';
    import { supabase } from '../../supabaseClient';
    
    function DriverRecordCard({ driver, isEditMode = false }) {
      const [activeTab, setActiveTab] = useState('details')
      const [driversLicense, setDriversLicense] = useState(null)
      const [policeRecord, setPoliceRecord] = useState(null)
      const [criminalRecord, setCriminalRecord] = useState(null)
      const [profilePhoto, setProfilePhoto] = useState(null)
      const [driversLicenseUrl, setDriversLicenseUrl] = useState(null)
      const [policeRecordUrl, setPoliceRecordUrl] = useState(null)
      const [criminalRecordUrl, setCriminalRecordUrl] = useState(null)
      const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
      const [expandedImage, setExpandedImage] = useState(null)
      const modalRef = useRef(null)
    
      const [fullName, setFullName] = useState(driver?.full_name || '')
      const [address, setAddress] = useState(driver?.address || '')
      const [phone, setPhone] = useState(driver?.phone || '')
      const [email, setEmail] = useState(driver?.email || '')
    
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
            console.error('Error uploading image:', error)
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
            console.error('Error updating driver record:', updateError)
            alert(updateError.message)
          } else {
            alert('Image uploaded and driver record updated successfully!')
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
              address: address,
              phone: phone,
              email: email,
            })
            .eq('id', driver.id)
    
          if (error) {
            console.error('Error updating driver:', error)
            alert(error.message)
          } else {
            console.log('Driver updated:', data)
            alert('Driver updated successfully!')
          }
    
          if (activeTab === 'photos') {
            // Upload photos only if the 'photos' tab is active
            // Upload photos only if the 'photos' tab is active
            if (driversLicense) {
              await handleImageUpload({ target: { files: [driversLicense] } }, setDriversLicense, 'drivers_license_photo', 'DriversLicense');
            }
            if (policeRecord) {
              await handleImageUpload({ target: { files: [policeRecord] } }, setPoliceRecord, 'police_records_photo', 'PoliceRecord');
            }
            if (criminalRecord) {
              await handleImageUpload({ target: { files: [criminalRecord] } }, setCriminalRecord, 'criminal_records_photo', 'CriminalRecord');
            }
            if (profilePhoto) {
              await handleImageUpload({ target: { files: [profilePhoto] } }, setProfilePhoto, 'profile_photo', 'ProfilePhoto');
            }
          }
        } catch (error) {
          console.error('Error updating driver:', error.message)
          alert(error.message)
        }
      }
    
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Driver Details</h2>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-800 mb-2">
                <strong>Address:</strong> {driver?.address}
              </p>
              <p className="text-gray-800 mb-2">
                <strong>Phone:</strong> {driver?.phone}
              </p>
              <p className="text-gray-800 mb-2">
                <strong>Email:</strong> {driver?.email}
              </p>
            </div>
          </div>
    
          <hr className="my-6 border-gray-300" />
    
          <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900">Photos</h3>
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
        </div>
      )
    }
    
    export default DriverRecordCard
