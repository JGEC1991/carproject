import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error.message);
        alert(error.message);
      } else {
        console.log('Logged in:', data);
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      alert(error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Login Form */}
      <div className="w-full max-w-md m-auto bg-white rounded-lg border border-gray-200 shadow-default py-10 px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            <span className="text-blue-500">CarFleet</span> Pro
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <button className="py-2 px-4 text-blue-500 font-semibold focus:outline-none border-b-2 border-blue-500">
            Iniciar sesion
          </button>
          <Link to="/signup" className="py-2 px-4 text-gray-600 font-semibold focus:outline-none">
            Registrar una cuenta
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Correo electronico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Iniciar
            </button>
          </div>
        </form>
      </div>

      {/* Welcome Section */}
      <div className="w-full lg:w-1/2 bg-gray-800 text-white flex flex-col justify-center items-center p-12">
        <h1 className="text-3xl font-bold mb-6">Simplifica la forma en la que rentas tus vehiculos!</h1>
        <p className="text-lg text-center">
          La plataforma todo en uno para manejar tus vehiculos de manera eficaz.
        </p>
      </div>
    </div>
  );
}

export default Login;
