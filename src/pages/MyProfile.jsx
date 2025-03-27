import { useState, useEffect } from 'react';
    import { supabase } from '../supabaseClient';
    import { useNavigate, Link } from 'react-router-dom';
    import {
      Card,
      CardHeader,
      CardBody,
      Typography,
      Input,
      Button,
      Checkbox,
      Select,
      Option,
    } from "@material-tailwind/react";

    const MyProfile = () => {
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [profile, setProfile] = useState(null);
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');
      const [email, setEmail] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [message, setMessage] = useState('');
      const navigate = useNavigate();
      const [assignedVehicle, setAssignedVehicle] = useState(null);
      const [driverDetails, setDriverDetails] = useState(null);
      const [isDriver, setIsDriver] = useState(false);
      const [userRole, setUserRole] = useState('');
      const [availableVehicles, setAvailableVehicles] = useState([]);
      const [selectedVehicle, setSelectedVehicle] = useState('');
      const [session, setSession] = useState(null); // Add session state

      useEffect(() => {
        const getSession = async () => {
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
              setError(sessionError.message);
              return;
            }
            setSession(session);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
        getSession();

        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
      }, []);

      useEffect(() => {
        const fetchProfile = async () => {
          setLoading(true);
          setError(null);

          try {
            if (session?.user?.id) {
              const { data: user, error } = await supabase
                .from('users')
                .select('name, phone, email, is_driver, id, role')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching user:', error);
                return;
              }

              if (user) {
                setProfile(user);
                setName(user.name || '');
                setEmail(session.user.email || ''); // Set email from session
                setPhone(user.phone || '');
                setIsDriver(user.is_driver || false);
                setUserRole(user.role || '');

                if (user.is_driver) {
                  fetchDriverDetails(session.user.id);
                } else {
                  setDriverDetails(null); // Clear driver details if not a driver
                }
              }
            }
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        };

        const fetchDriverDetails = async (userId) => {
          try {
            const { data: driverData, error: driverError } = await supabase
              .from('drivers')
              .select('*')
              .eq('user_id', userId) // Use user_id instead of id
              .single();

            if (driverError) {
              console.error('Error fetching driver details:', driverError);
              setDriverDetails(null); // Ensure driverDetails is null if there's an error
              return;
            }

            setDriverDetails(driverData);
            if (driverData?.vehicle_id) {
              fetchAssignedVehicle(driverData.vehicle_id);
            }
          } catch (err) {
            console.error('Error fetching driver details:', err);
            setDriverDetails(null); // Ensure driverDetails is null in case of an exception
          }
        };

        const fetchAssignedVehicle = async (vehicleId) => {
          try {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from('vehicles')
              .select('make, model, license_plate')
              .eq('id', vehicleId)
              .single();

            if (vehicleError) {
              console.error('Error fetching assigned vehicle:', vehicleError);
              return;
            }

            setAssignedVehicle(vehicleData);
          } catch (err) {
            console.error('Error fetching assigned vehicle:', err);
          }
        };

        const fetchAvailableVehicles = async () => {
          try {
            // Fetch vehicles that are not currently assigned to any driver
            const { data: availableVehicleData, error: availableVehicleError } = await supabase
              .from('vehicles')
              .select('id, make, model, license_plate')
              .is('driver_id', null);

            if (availableVehicleError) {
              console.error('Error fetching available vehicles:', availableVehicleError);
              return;
            }

            setAvailableVehicles(availableVehicleData);
          } catch (err) {
            console.error('Error fetching available vehicles:', err);
          }
        };

        if (session) {
          fetchProfile();
          fetchAvailableVehicles();
        } else {
          setLoading(false);
        }
      }, [session?.user?.id]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          if (!profile?.id) {
            setError('User ID is undefined. Please refresh the page.');
            return;
          }
          const { error } = await supabase
            .from('users')
            .update({ name, phone })
            .eq('id', profile.id);

          if (error) {
            setError(error.message);
            return;
          }

          alert('Profile updated successfully!');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            setError(`Error updating password: ${error.message}`);
          } else {
            setMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
          }
        } catch (err) {
          setError(`Unexpected error: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Profile Details */}
            <div className="md:w-1/2">
              <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                  <Typography variant="h5" color="blue-gray">
                    Mi perfil
                  </Typography>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit} className="max-w-lg">
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre
                      </label>
                      <Input
                        type="text"
                        id="name"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Correo Electronico
                      </label>
                      <Input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={email}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                        Telefono
                      </label>
                      <Input
                        type="tel"
                        id="phone"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <Typography variant="small" color="gray">
                        Rol: {userRole}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        color="green"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Actualizar perfil'}
                      </Button>
                    </div>
                  </form>
                  <form onSubmit={handleUpdatePassword} className="max-w-lg mt-6">
                    <h2 className="text-xl font-semibold mb-2">Cambiar Contraseña</h2>
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">
                        Nueva Contraseña
                      </label>
                      <Input
                        type="password"
                        id="newPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva Contraseña"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                        Confirmar Contraseña
                      </label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar Contraseña"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        color="blue"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Updating Password...' : 'Actualizar Contraseña'}
                      </Button>
                    </div>
                    {message && <p className="mt-4 text-sm">{message}</p>}
                    {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
                  </form>
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Driver Details and Assigned Vehicle */}
            <div className="md:w-1/2">
              <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                  <Typography variant="h5" color="blue-gray">
                    Detalles de Conductor
                  </Typography>
                </CardHeader>
                <CardBody>
                  {session?.user && isDriver && driverDetails ? (
                    <>
                      <Typography variant="h6" color="gray">
                        Informacion de Licencia
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Licencia: {driverDetails.license_number || 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Direccion: {driverDetails.address || 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Telefono: {driverDetails.phone || 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Correo Electronico: {driverDetails.email || 'N/A'}
                      </Typography>
                      <Typography variant="h6" color="gray" className="mt-4">
                        Documentos
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Foto de Licencia: {driverDetails.license_image_url ? <a href={driverDetails.license_image_url} target="_blank" rel="noopener noreferrer">Ver</a> : 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Antecedentes Policiales: {driverDetails.police_records_url ? <a href={driverDetails.police_records_url} target="_blank" rel="noopener noreferrer">Ver</a> : 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Antecedentes Criminales: {driverDetails.criminal_records_url ? <a href={driverDetails.criminal_records_url} target="_blank" rel="noopener noreferrer">Ver</a> : 'N/A'}
                      </Typography>
                      <Typography color="gray" className="mb-2">
                        Foto de perfil: {driverDetails.photo_url ? <a href={driverDetails.photo_url} target="_blank" rel="noopener noreferrer">Ver</a> : 'N/A'}
                      </Typography>
                      <Typography variant="h6" color="gray" className="mt-4">
                        Vehiculo Asignado
                      </Typography>
                      {assignedVehicle ? (
                        <Link to={`/vehicles/${driverDetails.vehicle_id}`} className="text-blue-500 hover:text-blue-700">
                          {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.license_plate})
                        </Link>
                      ) : (
                        <Typography color="gray" className="mb-2">
                          No asignado
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography color="gray">No es conductor</Typography>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      );
    };

    export default MyProfile;
