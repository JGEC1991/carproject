import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'

const Admin = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
        // Optionally delete the auth user if the insert fails
        await supabase.auth.admin.deleteUser(authResponse.user.id);
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
      alert(`User added successfully! Temporary password is: ${randomPassword}. Please communicate this to the user securely.`);

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
        alert('User deleted successfully!');
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
          alert('User role updated successfully!');
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
              <input
                type="email"
                placeholder="Enter email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              <button
                onClick={handleAddUser}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Generar Invitacion
              </button>
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
        </div>
      )
    }

    export default Admin
