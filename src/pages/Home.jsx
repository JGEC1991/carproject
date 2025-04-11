import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Home = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [isDriver, setIsDriver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignup, setIsSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false); // New state variable

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Sign up the user
      const { data: authResponse, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            phone: phone,
            is_driver: isDriver,
          },
          redirectTo: 'https://jerentcars.netlify.app/confirmation', // Redirect to confirmation page
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setConfirmationSent(true); // Set confirmationSent to true

      // 2. Call the create_org_and_user function
      const { error: orgError } = await supabase.rpc('create_org_and_user', {
        org_name: organizationName,
        user_id: authResponse.user.id,
        user_email: email,
        user_name: name,
        user_phone: phone,
        user_is_driver: isDriver,
      })

      if (orgError) {
        // Delete the auth user if function fails
        await supabase.auth.admin.deleteUser(authResponse.user.id)
        setError(orgError.message)
        return
      }

      // 3. Update the user record in public.users and set is_owner to true
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_owner: true, // Set is_owner to true
        })
        .eq('id', authResponse.user.id);

      if (updateError) {
        setError(updateError.message);
        // Optionally delete the auth user if the update fails
        await supabase.auth.admin.deleteUser(authResponse.user.id);
        return;
      }

      // 4. Redirect to confirmation page
      navigate('/confirmation');

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLoginModal = () => {
    setShowLogin(!showLogin);
    setShowSignup(false);
    setError(null);
  };

  const toggleSignupModal = () => {
    setShowSignup(!showSignup);
    setShowLogin(false);
    setError(null);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
    setError(null);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
    setError(null);
  };

  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Car Fleet Pro
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Administra tu flota con facilidad!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toggleSignupModal}
            >
              Registrarse
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toggleLoginModal}
            >
              Ingresar
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Nuestras Caracteristicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                Gestion de Vehiculos
              </h3>
              <p className="text-gray-600">
                Administra todos tus vehiculos en un solo lugar.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                Control de Gastos
              </h3>
              <p className="text-gray-600">
                Lleva un registro de todos los gastos de tu flota.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                Reportes de Ingresos
              </h3>
              <p className="text-gray-600">
                Genera reportes de ingresos para una mejor gestion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Contactanos
          </h2>
          <p className="text-gray-600 mb-4">
            Tienes alguna pregunta? Contactanos!
          </p>
          <a
            href="mailto:soporte@example.com"
            className="text-blue-500 hover:text-blue-700"
          >
            soporte@example.com
          </a>
        </div>
      </section>

      {/* Login Modal */}
      <Modal isOpen={showLogin} onClose={toggleLoginModal}>
        <div className="bg-white rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleLoginModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Correo
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 focus:outline-none text-sm"
              onClick={switchToSignup}
            >
              Aun no tengo una cuenta
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs italic mt-4">{error}</p>
          )}
        </div>
      </Modal>

      {/* Signup Modal */}
      <Modal isOpen={showSignup} onClose={toggleSignupModal}>
        <div className="bg-white rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleSignupModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Registrarse</h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="organizationName"
            >
              Nombre de Organizacion
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="organizationName"
              type="text"
              placeholder="Nombre de tu empresa"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Nombre
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Correo electronico
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phone"
            >
              Numero de telefono
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone"
              type="tel"
              placeholder="Telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="isDriver"
            >
              Eres un conductor?
            </label>
            <input
              className="mr-2 leading-tight"
              type="checkbox"
              id="isDriver"
              checked={isDriver}
              onChange={(e) => setIsDriver(e.target.checked)}
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Crear'}
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 focus:outline-none text-sm"
              onClick={switchToLogin}
            >
              Ya tengo una cuenta
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs italic mt-4">{error}</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Home
