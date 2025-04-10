import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'
import { Button, Input, Typography, Select, Option } from "@material-tailwind/react";
import AutomaticActivities from '../components/AutomaticActivities';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [activityTypes, setActivityTypes] = useState([]);
  const [newActivityType, setNewActivityType] = useState('');
  const [organizationId, setOrganizationId] = useState(null);
  const [permissions, setPermissions] = useState({}); // Store permissions as an object
  const [maintenanceCadence, setMaintenanceCadence] = useState(30);

  const maintenanceCadenceOptions = [30, 45, 60, 90, 120, 180];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id, is_owner')
        .eq('id', userId)
        .single();

      if (orgError) {
        setError(orgError.message);
        return;
      }

      setOrganizationId(userData?.organization_id);
      setIsOwner(userData?.is_owner || false);

      if (!userData?.is_owner) {
        // Redirect non-owners
        return;
      }

      const { data, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('organization_id', userData.organization_id)

      if (usersError) {
        setError(usersError.message)
        return
      }

      setUsers(data)

      // Fetch organization data including maintenance_cadence_days
      const { data: orgData, error: orgDataError } = await supabase
        .from('organizations')
        .select('maintenance_cadence_days')
        .eq('id', userData.organization_id)
        .single();

      if (orgDataError) {
        console.error('Error fetching organization data:', orgDataError);
        // Handle error appropriately, maybe set a default value
      } else {
        setMaintenanceCadence(orgData?.maintenance_cadence_days || 30);
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, []);

  const fetchActivityTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        setError(error.message);
        return;
      }

      setActivityTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        setError(error.message);
        return;
      }

      // Convert the array of permissions to an object for easier access
      const permissionsObject = data.reduce((acc, permission) => {
        acc[permission.action] = permission.role;
        return acc;
      }, {});

      setPermissions(permissionsObject);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchActivityTypes();
    fetchPermissions();
  }, [fetchUsers, fetchActivityTypes, fetchPermissions]);

  const handleAddUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get the user's organization ID
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      // 2. Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);

      // 3. Create the user in auth.users
      const { data: authResponse, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: randomPassword,
        options: {
          data: {
            role: newRole,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // 4. Update the user record in public.users
      const { error: updateError } = await supabase
        .from('users')
        .update({
          organization_id: organizationId,
          role: newRole,
          name: newEmail, // Set the name to the email for simplicity
          email: newEmail,
        })
        .eq('id', authResponse.user.id);

      if (updateError) {
        setError(updateError.message);
        // Optionally delete the auth user if the update fails
        await supabase.auth.admin.deleteUser(authResponse.user.id);
        return;
      }

      // 5. Insert the user into the public.users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authResponse.user.id,
          organization_id: organizationId,
          role: newRole,
          name: newEmail,
          email: newEmail,
        });

      if (insertError) {
        setError(insertError.message);
        // Optionally delete the auth user and user record if the insert fails
        await supabase.auth.admin.deleteUser(authResponse.user.id);
        await supabase
          .from('users')
          .delete()
          .eq('id', authResponse.user.id);
        return;
      }

      // 6. Insert the user into the organization_members table
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: authResponse.user.id,
          role: newRole,
        });

      if (memberError) {
        setError(memberError.message);
        // Optionally delete the auth user and user record if the member insert fails
        await supabase.auth.admin.deleteUser(authResponse.user.id);
        await supabase
          .from('users')
          .delete()
          .eq('id', authResponse.user.id);
        return;
      }

      // 7. Refresh the user list
      await fetchUsers();
      setNewEmail('');
      setNewRole('user');
      alert(`Usuario agregado correctamente la contraseña temporal es: ${randomPassword}. Por favor comunicale esto al usuario de manera segura.`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete the user from auth.users
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
          setError(authError.message);
          return;
        }

        // Delete the user from the public.users table
        const { error: userError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (userError) {
          setError(userError.message);
          return;
        }

        // Refresh the user list
        await fetchUsers();
        alert('Usuario eleminado exitosamente!');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

          if (error) {
            setError(error.message);
            return;
          }

          // Refresh the user list
          await fetchUsers();
          alert('Rol de usuario actualizado con exito!');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

  const handleAddActivityType = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      const { data, error } = await supabase
        .from('activity_types')
        .insert([{ name: newActivityType, organization_id: organizationId }])
        .select();

      if (error) {
        setError(error.message);
        return;
      }

      await fetchActivityTypes();
      setNewActivityType('');
      alert('Tipo de actividad agregada exitosamente!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivityType = async (activityTypeId) => {
    if (window.confirm('Estar por eleminar un tipo de actividad!')) {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase
          .from('activity_types')
          .delete()
          .eq('id', activityTypeId);

        if (error) {
          setError(error.message);
          return;
        }

        await fetchActivityTypes();
        alert('Tipo de actividad eliminada exitosamente!');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePermissionChange = async (action, role) => {
    try {
      setLoading(true);
      setError(null);

      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      // Check if the permission already exists
      const { data: existingPermission, error: selectError } = await supabase
        .from('permissions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('action', action)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // Ignore "no data found" error
        setError(selectError.message);
        return;
      }

      if (existingPermission) {
        // Update the existing permission
        const { error: updateError } = await supabase
          .from('permissions')
          .update({ role })
          .eq('id', existingPermission.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }
      } else {
        // Insert a new permission
        const { error: insertError } = await supabase
          .from('permissions')
          .insert([{ organization_id: organizationId, action, role }]);

        if (insertError) {
          setError(insertError.message);
          return;
        }
      }

      // Refresh the permissions list
      await fetchPermissions();
      alert(`Permisos para ${action} actualizados exitosamente!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceCadenceChange = async (e) => {
    const newCadence = parseInt(e.target.value, 10);
    setMaintenanceCadence(newCadence);

    try {
      setLoading(true);
      setError(null);

      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
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

      const organizationId = userData?.organization_id;

      if (!organizationId) {
        setError('Unable to determine organization ID.');
        return;
      }

      // Update the maintenance cadence in the organizations table
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ maintenance_cadence_days: newCadence })
        .eq('id', organizationId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      alert('La cadencia de mantenimientos se actualizo correctamente!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

      if (loading) {
        return <div className="flex items-center justify-center h-full">Cargando...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      if (!isOwner) {
        return <Navigate to="/my-profile" replace />;
      }

      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-semibold mb-4">Panel de administracion</h1>

          {/* Add User Form */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Generar un token de invitacion</h2>
            <div className="flex space-x-4">
              <Input
                type="email"
                placeholder="Ingresar correo electronico"
                className="shadow appearance-none border-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <Button
                onClick={handleAddUser}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Generar Invitacion
              </Button>
            </div>
          </div>

          {/* User List */}
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Correo Electronico
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {user.name}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {user.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Activity Types Management */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-2">Administrar tipos de actividad</h2>
            <div className="flex space-x-4 mb-4">
              <Input
                type="text"
                placeholder="Nuevo tipo de actividad"
                className="shadow appearance-none border-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
              />
              <Button
                onClick={handleAddActivityType}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Agregar tipo de actividad
              </Button>
            </div>

            {activityTypes.length > 0 ? (
              <ul className="list-disc pl-5">
                {activityTypes.map((type) => (
                  <li key={type.id} className="flex items-center justify-between py-2">
                    {type.name}
                    <button
                      onClick={() => handleDeleteActivityType(type.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay tipos de actividad.</p>
            )}
          </div>

          {/* Automatic Activities Management */}
          <div className="mt-12">
            <AutomaticActivities />
          </div>

          {/* Permission Control Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-2">Control de permisos</h2>
            {/* Example Permission Controls */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quien puede borrar actividades
              </label>
              <select
                value={permissions['delete_activity'] || 'user'}
                onChange={(e) => handlePermissionChange('delete_activity', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quien puede editar el estado de "Pago de tarifa"
              </label>
              <select
                value={permissions['edit_pago_tarifa_status'] || 'user'}
                onChange={(e) => handlePermissionChange('edit_pago_tarifa_status', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quien puede editar el millaje de los vehiculos
              </label>
              <select
                value={permissions['edit_vehicle_mileage'] || 'user'}
                onChange={(e) => handlePermissionChange('edit_vehicle_mileage', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {/* Maintenance Cadence Setting */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-2">Configuracion de Cadencia de Mantenimiento</h2>
            <label htmlFor="maintenanceCadence" className="block text-gray-700 text-sm font-bold mb-2">
              Seleccionar Cadencia (dias)
            </label>
            <select
              id="maintenanceCadence"
              value={maintenanceCadence}
              onChange={handleMaintenanceCadenceChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {maintenanceCadenceOptions.map((cadence) => (
                <option key={cadence} value={cadence}>
                  {cadence}
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    }

    export default Admin
