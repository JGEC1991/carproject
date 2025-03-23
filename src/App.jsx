import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Activities from './pages/Activities'
import Revenue from './pages/Revenue'
import Expenses from './pages/Expenses'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Confirmation from './pages/Confirmation.jsx' 
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Sidebar from './components/Sidebar';
import MyProfile from './pages/MyProfile';

function App() {
  const [session, setSession] = useState(null)
  const [organizationName, setOrganizationName] = useState('Loading...')
  const [userName, setUserName] = useState('John Doe') 
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    const fetchOrganizationName = async () => {
      try {
        if (session?.user?.id) {
          const { data: user, error } = await supabase
            .from('users')
            .select('organization_id, name')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching user:', error)
            setOrganizationName('Error')
            return
          }

          if (user && user.organization_id) {
            const { data: organization, error: orgError } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', user.organization_id)
              .single()

            if (orgError) {
              console.error('Error fetching organization:', orgError)
              setOrganizationName('Error')
              return
            }

            if (organization && organization.name) {
              setOrganizationName(organization.name)
            } else {
              setOrganizationName('Organization Not Found')
            }
            setUserName(user.name || '');
          } else {
            setOrganizationName('')
          }
        } else {
          setOrganizationName('')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setOrganizationName('Error')
      }
    }

    fetchOrganizationName()
  }, [session])

  useEffect(() => {
    if (session?.user?.email_confirmed_at) {
      setEmailConfirmed(true);
    } else {
      setEmailConfirmed(false);
    }
  }, [session]);

  useEffect(() => {
    // Add Material Icons (This needs to be done only once)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);

    // Add Inter font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
  }, []);


  return (
    <>
      <BrowserRouter>
        {session ? (
          <div className="flex h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} session={session} />

            <div className="flex flex-col flex-1" style={{ marginLeft: isSidebarOpen ? '256px' : '0', transition: 'margin-left 0.3s ease-in-out' }}>
              <header className="bg-gray-100 shadow h-16 flex items-center justify-between px-6 border-b border-gray-200">
                <div>
                  <span className="text-gray-800 text-base font-medium">
                    {organizationName}
                  </span>
                </div>
                <button className="text-gray-800 focus:outline-none text-base font-medium">
                  {userName}
                </button>
              </header>

              <main className="bg-gray-100 p-6">
                <Routes>
                  <Route
                    path="/"
                    element={
                      session ? (
                        <Navigate to="/vehicles" replace />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/my-profile"
                    element={
                      session ? (
                        <MyProfile />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="/vehicles"
                    element={
                      session ? (
                        <Vehicles />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/drivers"
                    element={
                      session ? (
                        <Drivers />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/activities"
                    element={
                      session ? (
                        <Activities />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/revenue"
                    element={
                      session ? (
                        <Revenue />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      session ? (
                        <Expenses />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      session ? (
                        <Dashboard />
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      session ? (
                        emailConfirmed ? (
                          <Admin />
                        ) : (
                          <Navigate to="/confirmation" replace />
                        )
                      ) : (
                        <Home />
                      )
                    }
                  />
                  <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Home />
        )}
      </BrowserRouter>
    </>
  )
}

export default App
