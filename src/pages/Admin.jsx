import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'
import { Button, Input, Typography, Select, Option, Checkbox } from "@material-tailwind/react";
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
  const [newActivityTypeRequiresDateFilter, setNewActivityTypeRequiresDateFilter] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [maintenanceCadence, setMaintenanceCadence] = useState(30);

  const maintenanceCadenceOptions = [30, 45, 60, 90, 120, 180];

  const fetchUsers = useCallback(async () => {
    setError(null);
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id, is_owner')
        .eq('id', userId)
        .single();
      if (orgError) throw orgError;

      setOrganizationId(userData?.organization_id);
      setIsOwner(userData?.is_owner || false);

      if (!userData?.is_owner) return; // Early exit for non-owners

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('organization_id', userData.organization_id);
      if (usersError) throw usersError;
      setUsers(usersData);

      const { data: orgData, error: orgDataError } = await supabase
        .from('organizations')
        .select('maintenance_cadence_days')
        .eq('id', userData.organization_id)
        .single();
      if (orgDataError) console.error('Error fetching org data:', orgDataError);
      else setMaintenanceCadence(orgData?.maintenance_cadence_days || 30);

    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchActivityTypes = useCallback(async () => {
    setError(null);
    try {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();
      if (orgError) throw orgError;
      const organizationId = userData?.organization_id;
      if (!organizationId) throw new Error('Organization ID not found');

      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      setActivityTypes(data);

    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setError(null);
    try {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();
      if (orgError) throw orgError;
      const organizationId = userData?.organization_id;
      if (!organizationId) throw new Error('Organization ID not found');

      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;

      const permissionsObject = data.reduce((acc, permission) => {
        acc[permission.action] = permission.role;
        return acc;
      }, {});
      setPermissions(permissionsObject);

    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchActivityTypes(),
        fetchPermissions()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, [fetchUsers, fetchActivityTypes, fetchPermissions]); // Dependencies are correct

  const handleAddUser = async () => {
    // setLoading(true); // Consider managing loading state per action
    setError(null);
    try {
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = authUser.user.id;

      const { data: userData, error: orgError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();
      if (orgError) throw orgError;
      const organizationId = userData?.organization_id;
      if (!organizationId) throw new Error('Unable to determine organization ID.');

      const randomPassword = Math.random().toString(36).slice(-8);

      const { data: authResponse, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: randomPassword,
        options: { data: { role: newRole } },
      });
      if (authError) throw authError;

      // Use upsert for user profile to handle potential race conditions or existing stubs
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authResponse.user.id,
          organization_id: organizationId,
          role: newRole,
          name: newEmail, // Default name to email
          email: newEmail,
        }, { onConflict: 'id' }); // Specify conflict resolution if needed, or handle separately
      if (upsertError) throw upsertError;


      // Insert into organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: authResponse.user.id,
          role: newRole,
        });
      // Consider handling potential duplicate member entries if necessary
      if (memberError && memberError.code !== '23505') { // Ignore unique violation if user might already be a member
         // If insert fails for other reasons, attempt cleanup
         console.error("Error adding org member:", memberError);
         // Consider cleanup logic here if needed (delete auth user, user profile)
         throw memberError;
      }


      await fetchUsers();
      setNewEmail('');
      setNewRole('user');
      alert(`Usuario agregado correctamente la contraseña temporal es: ${randomPassword}. Por favor comunicale esto al usuario de manera segura.`);

    } catch (err) {
      setError(`Error al agregar usuario: ${err.message}`);
      // Add more robust error handling/cleanup if needed
    } finally {
      // setLoading(false);
    }
  };

  const handleDeleteUser = async (userIdToDelete) => {
    // Prevent owner from deleting themselves? Add check if needed.
    if (window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      // setLoading(true);
      setError(null);
      try {
        // Attempt to delete from auth first
        const { error: authError } = await supabase.auth.admin.deleteUser(userIdToDelete);
        // Handle cases where user might not exist in auth but exists elsewhere
        if (authError && authError.message !== 'User not found') {
            throw authError; // Throw unexpected auth errors
        }

        // Delete from public.users (might cascade delete from org_members depending on FK constraints)
        const { error: userError } = await supabase
          .from('users')
          .delete()
          .eq('id', userIdToDelete);
        if (userError) throw userError;

        // Optional: Explicitly delete from organization_members if cascade delete isn't set up
        // const { error: memberError } = await supabase
        //   .from('organization_members')
        //   .delete()
        //   .eq('user_id', userIdToDelete);
        // if (memberError) throw memberError;


        await fetchUsers(); // Refresh list
        alert('Usuario eliminado exitosamente!');

      } catch (err) {
        setError(`Error al eliminar usuario: ${err.message}`);
        alert(`Error al eliminar usuario: ${err.message}`); // Show error to user
      } finally {
        // setLoading(false);
      }
    }
  };

  const handleRoleChange = async (userId, newRoleValue) => {
    // setLoading(true);
    setError(null);
    try {
      // Update role in public.users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ role: newRoleValue })
        .eq('id', userId);
      if (userUpdateError) throw userUpdateError;

      // Update role in organization_members table
      const { error: memberUpdateError } = await supabase
        .from('organization_members')
        .update({ role: newRoleValue })
        .eq('user_id', userId)
        .eq('organization_id', organizationId); // Ensure we only update for the current org
      if (memberUpdateError) throw memberUpdateError;

      // Optional: Update role in auth.users custom data (if used)
      // const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      //   userId, { user_metadata: { role: newRoleValue } } // or app_metadata
      // );
      // if (authUpdateError) throw authUpdateError;

      await fetchUsers(); // Refresh list
      alert('Rol de usuario actualizado con exito!');
    } catch (err) {
      setError(`Error al cambiar rol: ${err.message}`);
      alert(`Error al cambiar rol: ${err.message}`);
      // Consider reverting changes if one part fails
    } finally {
      // setLoading(false);
    }
  };

  const handleAddActivityType = async () => {
    if (!newActivityType.trim()) {
        alert('Por favor ingrese un nombre para el tipo de actividad.');
        return;
    }
    // setLoading(true);
    setError(null);
    try {
      if (!organizationId) throw new Error('Organization ID not found');

      const { data, error } = await supabase
        .from('activity_types')
        .insert([{
          name: newActivityType.trim(),
          organization_id: organizationId,
          require_photo_date_filter: newActivityTypeRequiresDateFilter
        }])
        .select(); // Select to confirm insertion

      if (error) throw error;

      await fetchActivityTypes(); // Refresh list
      setNewActivityType('');
      setNewActivityTypeRequiresDateFilter(false); // Reset form
      alert('Tipo de actividad agregada exitosamente!');
    } catch (err) {
      setError(`Error al agregar tipo de actividad: ${err.message}`);
      alert(`Error al agregar tipo de actividad: ${err.message}`);
    } finally {
      // setLoading(false);
    }
  };

  const handleDeleteActivityType = async (activityTypeId) => {
    if (window.confirm('Esta por eliminar un tipo de actividad! Esto podria afectar actividades existentes.')) {
      // setLoading(true);
      setError(null);
      try {
        // Check if activities use this type? Optional, depends on desired behavior.
        const { error } = await supabase
          .from('activity_types')
          .delete()
          .eq('id', activityTypeId);

        if (error) throw error;

        await fetchActivityTypes(); // Refresh list
        alert('Tipo de actividad eliminada exitosamente!');
      } catch (err) {
        setError(`Error al eliminar tipo de actividad: ${err.message}`);
        alert(`Error al eliminar tipo de actividad: ${err.message}`);
      } finally {
        // setLoading(false);
      }
    }
  };

  // --- OPTIMISTIC UPDATE for Checkbox ---
  const handleActivityTypeDateFilterToggle = async (activityTypeId, currentValue) => {
    const newValue = !currentValue;

    // 1. Optimistically update the UI state
    setActivityTypes(prevTypes =>
      prevTypes.map(type =>
        type.id === activityTypeId
          ? { ...type, require_photo_date_filter: newValue }
          : type
      )
    );

    setError(null); // Clear previous errors

    try {
      // 2. Update the database
      const { error } = await supabase
        .from('activity_types')
        .update({ require_photo_date_filter: newValue })
        .eq('id', activityTypeId);

      if (error) {
        // 3. Revert UI on error
        setActivityTypes(prevTypes =>
          prevTypes.map(type =>
            type.id === activityTypeId
              ? { ...type, require_photo_date_filter: currentValue } // Revert back
              : type
          )
        );
        throw error; // Throw error to be caught below
      }

      // 4. Optional: Show success message (or remove if UI update is enough)
      // console.log('Configuracion de filtro de fecha actualizada!');

    } catch (err) {
      setError(`Error al actualizar filtro de fecha: ${err.message}`);
      alert(`Error al actualizar filtro de fecha: ${err.message}`);
      // UI is already reverted by the time we get here if error occurred in try block
    }
    // No finally block needed for loading state if removed
    // No need to call fetchActivityTypes unless you want to double-verify consistency
  };
  // --- End Optimistic Update ---


  const handlePermissionChange = async (action, role) => {
    // setLoading(true);
    setError(null);
    try {
      if (!organizationId) throw new Error('Organization ID not found');

      // Use upsert to handle both insert and update scenarios
      const { error } = await supabase
        .from('permissions')
        .upsert({
            organization_id: organizationId,
            action: action,
            role: role
        }, {
            onConflict: 'organization_id, action' // Specify conflict columns
        });

      if (error) throw error;

      // Update local state optimistically or fetch again
      setPermissions(prev => ({ ...prev, [action]: role })); // Optimistic update
      // await fetchPermissions(); // Or fetch again

      alert(`Permisos para ${action} actualizados exitosamente!`);
    } catch (err) {
      setError(`Error al actualizar permisos: ${err.message}`);
      alert(`Error al actualizar permisos: ${err.message}`);
    } finally {
      // setLoading(false);
    }
  };

  const handleMaintenanceCadenceChange = async (eventOrValue) => {
    // Handle both direct value (from Select onChange) and event object
    const newCadence = parseInt(typeof eventOrValue === 'object' ? eventOrValue.target.value : eventOrValue, 10);

    // Optimistically update local state
    setMaintenanceCadence(newCadence);
    setError(null);

    try {
      if (!organizationId) throw new Error('Organization ID not found');

      const { error } = await supabase
        .from('organizations')
        .update({ maintenance_cadence_days: newCadence })
        .eq('id', organizationId);

      if (error) {
        // Revert optimistic update? Fetching org data again might be simpler
        await fetchUsers(); // Re-fetch user/org data to get potentially reverted cadence
        throw error;
      }

      alert('La cadencia de mantenimientos se actualizo correctamente!');
    } catch (err) {
      setError(`Error al actualizar cadencia: ${err.message}`);
      alert(`Error al actualizar cadencia: ${err.message}`);
    } finally {
      // setLoading(false); // If using loading state
    }
  };

      if (loading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div> // Use h-screen for full height
      }

      if (error && !isOwner) { // Show error prominently if user is not owner and error occurs
         return <div className="p-6 text-red-500">Error: {error}</div>;
      }

      if (!isOwner && !loading) { // Redirect non-owners only after loading is complete
        return <Navigate to="/my-profile" replace />;
      }

      // Main Admin Content
      return (
        <div className="container mx-auto p-6 space-y-12"> {/* Added space-y for vertical spacing */}
          <h1 className="text-3xl font-semibold mb-6">Panel de administracion</h1>
          {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">Error: {error}</div>} {/* Show errors clearly */}

          {/* Add User Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white"> {/* Added bg-white */}
            <h2 className="text-xl font-semibold mb-4">Generar un token de invitacion</h2>
            <div className="flex flex-col md:flex-row gap-4 items-end"> {/* Use gap for spacing */}
              <div className="flex-grow">
                <Input
                  type="email"
                  label="Correo Electronico"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  // Removed className="flex-grow" as Input might handle width, or use w-full on parent div
                />
              </div>
              <div className="w-full md:w-48"> {/* Fixed width for select */}
                <Select label="Rol" value={newRole} onChange={(val) => setNewRole(val)}>
                  <Option value="user">Usuario</Option>
                  <Option value="admin">Administrador</Option>
                </Select>
              </div>
              <Button
                onClick={handleAddUser}
                color="green"
                className="w-full md:w-auto" // Keep responsive width
              >
                Generar Invitacion
              </Button>
            </div>
          </section>

          {/* User List Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white overflow-x-auto"> {/* Added bg-white */}
            <h2 className="text-xl font-semibold mb-4">Administrar Usuarios</h2>
            <table className="min-w-full divide-y divide-gray-200"> {/* Use divide-y */}
              <thead className="bg-gray-50"> {/* Use thead class */}
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Electronico
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-32"> {/* Constrain width of select */}
                        <Select
                          value={user.role}
                          onChange={(val) => handleRoleChange(user.id, val)}
                          size="md" // Adjust size if needed
                        >
                          <Option value="user">Usuario</Option>
                          <Option value="admin">Administrador</Option>
                        </Select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        color="red"
                        size="sm"
                        variant="text" // Use text variant for no background/border
                      >
                        Borrar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>


          {/* Activity Types Management Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white"> {/* Added bg-white */}
            <h2 className="text-xl font-semibold mb-4">Administrar tipos de actividad personalizados</h2>
            {/* Add Form */}
            <div className="flex flex-col md:flex-row gap-4 items-end mb-6"> {/* Use gap, items-end */}
              <div className="flex-grow">
                <Input
                  type="text"
                  label="Nuevo tipo de actividad"
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                />
              </div>
              <Checkbox
                label="Requiere foto de hoy?"
                checked={newActivityTypeRequiresDateFilter}
                onChange={(e) => setNewActivityTypeRequiresDateFilter(e.target.checked)}
                // containerProps={{ className: "self-center" }} // Align checkbox if needed
              />
              <Button
                onClick={handleAddActivityType}
                color="blue"
                className="w-full md:w-auto"
              >
                Agregar tipo
              </Button>
            </div>

            {/* List */}
            {activityTypes.length > 0 ? (
              <ul className="divide-y divide-gray-200"> {/* Use divide-y */}
                {activityTypes.map((type) => (
                  <li key={type.id} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    <div className="flex items-center space-x-3"> {/* Use space-x */}
                       <Checkbox
                          // label="Requiere foto de hoy?" // Label might be redundant here, use title
                          checked={type.require_photo_date_filter || false}
                          onChange={() => handleActivityTypeDateFilterToggle(type.id, type.require_photo_date_filter)}
                          title="Marcar si el adjunto para este tipo de actividad debe ser una foto tomada hoy."
                          color="blue" // Match button color?
                       />
                       <Button
                         onClick={() => handleDeleteActivityType(type.id)}
                         color="red"
                         size="sm"
                         variant="text" // Use text variant for less emphasis
                       >
                         Borrar
                       </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No hay tipos de actividad personalizados.</p>
            )}
          </section>

          {/* Automatic Activities Management Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white"> {/* Added bg-white */}
             <h2 className="text-xl font-semibold mb-4">Actividades Automaticas</h2> {/* Added title */}
            <AutomaticActivities />
          </section>

          {/* Permission Control Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white"> {/* Added bg-white */}
            <h2 className="text-xl font-semibold mb-4">Control de permisos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Use gap, adjust columns */}
              <div> {/* Wrap each Select in a div for better spacing control */}
                 <Select
                    label="Quien puede borrar actividades"
                    value={permissions['delete_activity'] || 'user'} // Default to 'user' if undefined
                    onChange={(val) => handlePermissionChange('delete_activity', val)}
                  >
                    <Option value="user">Usuario</Option>
                    <Option value="admin">Administrador</Option>
                  </Select>
              </div>
              <div>
                 <Select
                    label='Quien puede editar "Pago de tarifa"' // Shorter label
                    value={permissions['edit_pago_tarifa_status'] || 'user'}
                    onChange={(val) => handlePermissionChange('edit_pago_tarifa_status', val)}
                  >
                    <Option value="user">Usuario</Option>
                    <Option value="admin">Administrador</Option>
                  </Select>
              </div>
              <div>
                 <Select
                    label="Quien puede editar millaje vehiculos" // Shorter label
                    value={permissions['edit_vehicle_mileage'] || 'user'}
                    onChange={(val) => handlePermissionChange('edit_vehicle_mileage', val)}
                  >
                    <Option value="user">Usuario</Option>
                    <Option value="admin">Administrador</Option>
                  </Select>
              </div>
              {/* Add more permission controls as needed */}
            </div>
          </section>

          {/* Maintenance Cadence Setting Section */}
          <section className="p-4 border rounded-lg shadow-sm bg-white"> {/* Added bg-white */}
            <h2 className="text-xl font-semibold mb-4">Configuracion de Cadencia de Mantenimiento</h2>
            <div className="w-full md:w-1/2 lg:w-1/3"> {/* Adjust width */}
              <Select
                label="Seleccionar Cadencia (dias)"
                value={maintenanceCadence.toString()} // Select expects string value
                onChange={handleMaintenanceCadenceChange} // Pass handler directly
              >
                {maintenanceCadenceOptions.map((cadence) => (
                  <Option key={cadence} value={cadence.toString()}>
                    {`${cadence} dias`} {/* Add units */}
                  </Option>
                ))}
              </Select>
            </div>
          </section>
        </div>
      )
    }

    export default Admin
