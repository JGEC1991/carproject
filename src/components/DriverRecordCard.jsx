import React, { useState, useRef, useEffect } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useTranslation } from 'react-i18next';

    function DriverRecordCard({ driver, activeTab, setActiveTab }) {
      const [fullName, setFullName] = useState(driver?.name || '');
      const [homeAddress, setHomeAddress] = useState(driver?.home_address || '');
      const [phone, setPhone] = useState(driver?.phone || '');
      const [email, setEmail] = useState(driver?.email || '');
      const [driversLicense, setDriversLicense] = useState(null);
      const [policeRecord, setPoliceRecord] = useState(null);
      const [criminalRecord, setCriminalRecord] = useState(null);
      const [nationalId, setNationalId] = useState(null);
      const [profilePhoto, setProfilePhoto] = useState(null);
      const modalRef = useRef(null);
      const { t } = useTranslation('driverRecordCard');
      const [expandedImage, setExpandedImage] = useState(null);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            setExpandedImage(null);
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [modalRef]);

      const handleImageUpload = async (e, setImageState, imageUrlField, folder) => {
        const file = e.target.files[0];
        setImageState(file);

        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${driver.id}-${imageUrlField}.${fileExt}`;
          const filePath = `drivers/${driver.name}/${imageUrlField}/${fileName}`;

          const { data, error } = await supabase.storage
            .from('jerentcars-storage')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              public: true,
              contentType: file.type,
            });

          if (error) {
            console.error('Error uploading image:', error);
            alert(error.message);
            return;
          }

          const imageUrl = supabase.storage
            .from('jerentcars-storage')
            .getPublicUrl(filePath)
            .data.publicUrl;

          const { error: updateError } = await supabase
            .from('drivers')
            .update({ [imageUrlField]: imageUrl })
            .eq('id', driver.id);

          if (updateError) {
            console.error('Error updating driver record:', updateError);
            alert(updateError.message);
          } else {
            alert('Image uploaded and driver record updated successfully!');
            window.location.reload();
          }
        } catch (error) {
          console.error('Error uploading image:', error.message);
          alert(error.message);
        }
      };

      const handleExpandImage = (imageUrl) => {
        setExpandedImage(imageUrl);
      };

      const handleCloseExpandedImage = () => {
        setExpandedImage(null);
      };

      const handleSave = async () => {
        try {
          const { data, error } = await supabase
            .from('drivers')
            .update({
              name: fullName,
              home_address: homeAddress,
              phone: phone,
              email: email,
            })
            .eq('id', driver.id);

          if (error) {
            console.error('Error updating driver:', error);
            alert(error.message);
          } else {
            console.log('Driver updated:', data);
            alert('Driver updated successfully!');
          }
        } catch (error) {
          console.error('Error updating driver:', error.message);
          alert(error.message);
        }
      };

      return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Detalles de conductor</h2>
            <p className="text-gray-600">Driver ID: {driver?.id}</p>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('details')}
            >
              Detalles
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'photos' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('photos')}
            >
              Fotos
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Direccion</label>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar direccion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar telefono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electronico</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ingresar correo electronico"
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Fotos del conductor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Photo upload sections */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Foto de licencia</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setDriversLicense, 'license_image_url', 'DriversLicense')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {driver?.license_image_url && (
                      <img
                        src={driver.license_image_url}
                        alt="Foto de licencia"
                        className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                        onClick={() => handleExpandImage(driver.license_image_url)}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Antecedentes policiales</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setPoliceRecord, 'police_records_url', 'PoliceRecord')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {driver?.police_records_url && (
                      <img
                        src={driver.police_records_url}
                        alt="Antecedentes policiales"
                        className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                        onClick={() => handleExpandImage(driver.police_records_url)}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Antecedentes criminales</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setCriminalRecord, 'criminal_records_url', 'CriminalRecord')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {driver?.criminal_records_url && (
                      <img
                        src={driver.criminal_records_url}
                        alt="Antecedentes criminales"
                        className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                        onClick={() => handleExpandImage(driver.criminal_records_url)}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Identificacion nacional</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setNationalId, 'national_id_url', 'NationalId')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {driver?.national_id_url && (
                      <img
                        src={driver.national_id_url}
                        alt="Identificacion nacional"
                        className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                        onClick={() => handleExpandImage(driver.national_id_url)}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Foto de perfil</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setProfilePhoto, 'photo_url', 'ProfilePhoto')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {driver?.photo_url && (
                      <img
                        src={driver.photo_url}
                        alt="Foto de perfil"
                        className="mt-2 rounded-lg w-full h-40 object-cover cursor-pointer"
                        onClick={() => handleExpandImage(driver.photo_url)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
            >
              Guardar Cambios
            </button>
          </div>

          {/* Image Zoom Modal */}
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
      );
    }

    export default DriverRecordCard;
