import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState(''); // New state for password
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();

        if (authError) {
          setError(authError.message);
          return;
        }

        const userId = authUser.user.id;

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('name, phone, email')
          .eq('id', userId)
          .single();

        if (userError) {
          setError(userError.message);
          return;
        }

        setProfile(user);
        setName(user.name || '');
        setPhone(user.phone || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ name, phone })
        .eq('id', profile.id);

      if (error) {
        setError(error.message);
        return;
      }

      // Update password if a new password is provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) {
          setError(passwordError.message);
          return;
        }
      }

      alert('Profile updated successfully!');
      setNewPassword(''); // Clear the password field after successful update
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
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
                value={profile?.email}
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
            {/* New Password Input */}
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
        </CardBody>
      </Card>
    </div>
  );
};

export default MyProfile;
