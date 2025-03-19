import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';

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

      // 3. Redirect to confirmation page
      navigate('/confirmation');

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-semibold mb-4">
        Simplify Your Car Rental Business
      </h1>
      <p className="text-gray-600 mb-8">
        All-in-one platform to manage your car rentals with ease.
      </p>
      <LanguageSelector />

      {confirmationSent ? (
        <div className="text-green-500 mb-8">
          Please check your email to confirm your account.
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {!isSignup ? (
              <>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="organizationName"
                  >
                    Organization Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="organizationName"
                    type="text"
                    placeholder="Organization Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="isDriver"
                  >
                    Are you a driver?
                  </label>
                  <input
                    className="mr-2 leading-tight"
                    type="checkbox"
                    id="isDriver"
                    checked={isDriver}
                    onChange={(e) => setIsDriver(e.target.checked)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                onClick={isSignup ? handleSignup : handleLogin}
                disabled={loading}
              >
                {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
              </button>
              <button
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                type="button"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs italic mt-4">{error}</p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

export default Home
