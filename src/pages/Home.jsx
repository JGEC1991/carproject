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
  const [showDemoRequest, setShowDemoRequest] = useState(false);
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoVehicles, setDemoVehicles] = useState('');
  const [demoCity, setDemoCity] = useState('');
  const [demoCountry, setDemoCountry] = useState('');
  const [demoNeeds, setDemoNeeds] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

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

    const toggleDemoRequest = () => {
        setShowDemoRequest(!showDemoRequest);
    };

    const submitDemoRequest = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(''); // Clear any previous success message

        try {
            console.log('Submitting demo request with:', {
                phone: demoPhone,
                email: demoEmail,
                num_vehicles: demoVehicles,
                city: demoCity,
                country: demoCountry,
                business_needs: demoNeeds,
            });

            const { data, error } = await supabase
                .from('demo_requests')
                .insert([
                    {
                        phone: demoPhone,
                        email: demoEmail,
                        num_vehicles: demoVehicles,
                        city: demoCity,
                        country: demoCountry,
                        business_needs: demoNeeds,
                    },
                ]);

            if (error) {
                console.error('Supabase insert error:', error);
                setError(error.message);
            } else {
                console.log('Supabase insert data:', data);
                // Clear the form
                setDemoPhone('');
                setDemoEmail('');
                setDemoVehicles('');
                setDemoCity('');
                setDemoCountry('');
                setDemoNeeds('');

                setSuccessMessage('Su solicitud ha sido recibida y será procesada en las próximas 24 horas.');
                //toggleDemoRequest(); // Close the modal
            }
        } catch (err) {
            console.error('Error submitting demo request:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Optimiza la gestión de tu flota con Car Fleet Pro
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Centraliza el control de vehículos, conductores, gastos y mantenimiento en una plataforma intuitiva y segura.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={toggleLoginModal}
              >
                Iniciar Sesión
              </button>
              <button
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={toggleSignupModal}
              >
                Registrarse
              </button>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={toggleDemoRequest}
            >
              Solicitar una demostración
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                📸 Daños en vehículos sin registro visual
              </h3>
              <p className="text-gray-600">
                Ya no más falta de evidencia para respaldar reclamos por daños. Con nuestro Historial Fotográfico de Vehículos, puedes cargar y visualizar fotos a lo largo del tiempo, facilitando la documentación y seguimiento de daños. Esto proporciona pruebas tangibles para respaldar tus reclamaciones y agilizar los procesos con tu operador.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                🧾 Gastos operativos descontrolados
              </h3>
              <p className="text-gray-600">
                Controla tus finanzas con precisión. Nuestro módulo de Control de Gastos te permite registrar y analizar todos los gastos asociados a la flota, proporcionando informes detallados para una mejor toma de decisiones y optimización de recursos.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                🔧 Mantenimiento reactivo y costoso
              </h3>
              <p className="text-gray-600">
                Anticípate a los problemas antes de que ocurran. Con el Seguimiento de Mantenimiento, calculamos y mostramos el estado de mantenimiento de los vehículos, programando actividades preventivas automáticamente para evitar reparaciones costosas y tiempos de inactividad.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                🧑‍💼 Acceso no controlado a información sensible
              </h3>
              <p className="text-gray-600">
                Protege la información crítica de tu empresa. Implementamos Segmentación de Roles y Configuración de Permisos que restringe el acceso a ciertas funcionalidades y datos según el rol del usuario, asegurando que cada miembro del equipo acceda solo a la información que necesita.
              </p>
            </div>
            {/* Feature 5 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                📊 Información dispersa y difícil de analizar
              </h3>
              <p className="text-gray-600">
                Visualiza lo que realmente importa. Con Filtros Personalizables y Visibilidad de Columnas, adapta las vistas de datos según tus necesidades específicas, facilitando el análisis y la toma de decisiones informadas.
              </p>
            </div>
             {/* Feature 6 */}
             <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
              🔁 Tareas repetitivas que consumen tiempo valioso
              </h3>
              <p className="text-gray-600">
              Automatiza actividades recurrentes y gana eficiencia.
              Con nuestras Actividades Automáticas, puedes programar tareas periódicas como mantenimientos, inspecciones o renovaciones de documentos. Asignamos automáticamente estas actividades a los conductores y vehículos correspondientes, asegurando que se realicen puntualmente sin intervención manual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">
            ¿Listo para transformar la gestión de tu flota?
          </h2>
          <p className="text-gray-600 mb-4">
            Descubre cómo Car Fleet Pro puede mejorar la eficiencia y control de tus operaciones.
          </p>
          <a
            href="mailto:soporte@carfleetpro.com"
            className="text-blue-500 hover:text-blue-700"
          >
            soporte@carfleetpro.com
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

      {/* Demo Request Modal */}
      <Modal isOpen={showDemoRequest} onClose={toggleDemoRequest}>
        <div className="bg-white rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleDemoRequest}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Solicitar una Demostración</h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoPhone"
            >
              Teléfono
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoPhone"
              type="tel"
              placeholder="Teléfono"
              value={demoPhone}
              onChange={(e) => setDemoPhone(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoEmail"
            >
              Correo Electrónico
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoEmail"
              type="email"
              placeholder="Correo Electrónico"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoVehicles"
            >
              Número de Vehículos
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoVehicles"
              type="number"
              placeholder="Número de Vehículos"
              value={demoVehicles}
              onChange={(e) => setDemoVehicles(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoCity"
            >
              Ciudad
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoCity"
              type="text"
              placeholder="Ciudad"
              value={demoCity}
              onChange={(e) => setDemoCity(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoCountry"
            >
              País
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoCountry"
              type="text"
              placeholder="País"
              value={demoCountry}
              onChange={(e) => setDemoCountry(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="demoNeeds"
            >
              Necesidades de Negocio
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="demoNeeds"
              placeholder="Describa sus necesidades"
              value={demoNeeds}
              onChange={(e) => setDemoNeeds(e.target.value)}
            />
          </div>
          {successMessage && (
            <p className="text-green-500 text-xs italic mt-4">{successMessage}</p>
          )}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={submitDemoRequest}
              disabled={loading}
            >
              Enviar Solicitud
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home
