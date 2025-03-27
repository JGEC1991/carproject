import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Navigate } from 'react-router-dom';
import Table from '../components/Table';

const SuperAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const navigate = useNavigate();

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
    { key: 'organization_id', title: 'Organization ID' },
  ];

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
      } else {
        setSession(session);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        if (session?.user?.id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_super_admin')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            setError(userError.message);
            return;
          }

          setIsSuperAdmin(userData?.is_super_admin || false);

          if (userData?.is_super_admin) {
            const { data, error: usersError } = await supabase
              .from('users')
              .select('*');

            if (usersError) {
              setError(usersError.message);
              return;
            }

            setUsers(data);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/my-profile" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Super Admin Panel</h1>
      <p className="mb-4">Manage all users and organizations.</p>

      <Table
        data={users}
        columns={columns}
        onRowClick={(user) => {
          // Implement navigation to user details page if needed
          console.log('Selected user:', user);
        }}
      />
    </div>
  );
};

export default SuperAdmin;
