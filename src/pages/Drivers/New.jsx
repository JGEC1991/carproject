import React, { useState, useEffect } from 'react';
    import { supabase } from '../../supabaseClient';
    import { useNavigate, Link } from 'react-router-dom';

    const NewDriver = () => {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [newDriver, setNewDriver] = useState({
        name: '',
        license_number: '',
        phone: '',
        email: '',
        home_address: '',
      });
      const [photo, setPhoto] = useState(null);
      const [licenseImage, setLicenseImage] = useState(null);
      const [criminalRecords, setCriminalRecords] = useState(null);
      const [policeRecords, setPoliceRecords] = useState(null);
      const [nationalId, setNationalId] = useState(null);
      const navigate = useNavigate();
      const [organizationId, setOrganizationId] = useState(null);

      useEffect(() => {
        const fetchOrganizationId = async () => {
          try {
            const { data: authUser, error: authError } = await supabase.auth.getUser();
            if (authError) {
              setError(authError.message);
              return;
            }

            const userId = authUser.user.id;

            const { data: userData, error: orgError } = await supabase
              .from('users')
              .select('organization_id')
              .eq('id', userId)
              .single();

            if (orgError) {
              setError(orgError.message);
              return;
            }

            setOrganizationId(userData?.organization_id || null);
          } catch (error) {
            console.error('Error fetching organization ID:', error.message);
            setError(error.message);
          }
        };

        fetchOrganizationId();
      }, []);

      const handleInputChange = (e) => {
        setNewDriver({ ...newDriver, [e.target.id]: e.target.value });
      };

      const handleFileUpload = async (file, setImageState, fieldName) => {
        if (!file) return null;

        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${fieldName}.${fileExt}`;
          const filePath = `drivers/${newDriver.name}/${fieldName}/${fileName}`;

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
            setError(error.message);
            return null;
          }

          const imageUrl = supabase.storage
            .from('jerentcars-storage')
            .getPublicUrl(filePath)
            .data.publicUrl;

          setImageState(imageUrl);
          return imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error.message);
          setError(error.message);
          return null;
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          if (!organizationId) {
            setError('Organization ID not found. Please refresh the page.');
            return;
          }

          // Upload files and get URLs
          const photoUrl = await handleFileUpload(photo, setPhoto, 'photo_url');
          const licenseImageUrl = await handleFileUpload(licenseImage, setLicenseImage, 'license_image_url');
          const criminalRecordsUrl = await handleFileUpload(criminalRecords, setCriminalRecords, 'criminal_records_url');
          const policeRecordsUrl = await handleFileUpload(policeRecords, setPoliceRecords, 'police_records_url');
          const nationalIdUrl = await handleFileUpload(nationalId, setNationalId, 'national_id_url');

          const { data, error } = await supabase
            .from('drivers')
            .insert([
              {
                ...newDriver,
                organization_id: organizationId,
                photo_url: photoUrl,
                license_image_url: licenseImageUrl,
                criminal_records_url: criminalRecordsUrl,
                police_records_url: policeRecordsUrl,
                national_id_url: nationalIdUrl,
              },
            ])
            .select();

          if (error) {
            setError(error.message);
          } else {
            console.log('Driver added:', data);
            alert('Driver added successfully!');
            navigate('/drivers');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-semibold mb-4">Agregar un conductor</h1>
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          <form onSubmit={handleSubmit} className="max-w-lg">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
              <input type="text" id="name" name="name" value={newDriver.name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="license_number" className="block text-gray-700 text-sm font-bold mb-2">Numero de licencia</label>
              <input type="text" id="license_number" name="license_number" value={newDriver.license_number} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Telefono</label>
              <input type="tel" id="phone" name="phone" value={newDriver.phone} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo electronico</label>
              <input type="email" id="email" name="email" value={newDriver.email} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="home_address" className="block text-gray-700 text-sm font-bold mb-2">Direccion</label>
              <input type="text" id="home_address" name="home_address" value={newDriver.home_address} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-4">
              <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Foto</label>
              <input type="file" id="photo" name="photo" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="licenseImage" className="block text-gray-700 text-sm font-bold mb-2">Foto de Licencia</label>
              <input type="file" id="licenseImage" name="licenseImage" accept="image/*" onChange={(e) => setLicenseImage(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="criminalRecords" className="block text-gray-700 text-sm font-bold mb-2">Antecedentes Criminales</label>
              <input type="file" id="criminalRecords" name="criminalRecords" accept="image/*" onChange={(e) => setCriminalRecords(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="policeRecords" className="block text-gray-700 text-sm font-bold mb-2">Antecedentes Policiales</label>
              <input type="file" id="policeRecords" name="policeRecords" accept="image/*" onChange={(e) => setPoliceRecords(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="nationalId" className="block text-gray-700 text-sm font-bold mb-2">Identificacion Nacional</label>
              <input type="file" id="nationalId" name="nationalId" accept="image/*" onChange={(e) => setNationalId(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar conductor'}
              </button>
              <Link to="/drivers" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ml-4">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      );
    };

    export default NewDriver;
