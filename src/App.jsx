import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
    import Home from './pages/Home';
    import Vehicles from './pages/Vehicles';
    import Drivers from './pages/Drivers';
    import Activities from './pages/Activities';
    import Dashboard from './pages/Dashboard';
    import Admin from './pages/Admin';
    import Confirmation from './pages/Confirmation';
    import { useState, useEffect } from 'react';
    import { supabase } from './supabaseClient';
    import Sidebar from './components/Sidebar';
    import MyProfile from './pages/MyProfile';
    import VehicleRecord from './pages/Vehicles/[id]';
    import DriverRecord from './pages/Drivers/[id]';
    import ActivityRecord from './pages/Activities/[id]';
    import NewActivity from './pages/Activities/New';
    import NewVehicle from './pages/Vehicles/New';
    import NewDriver from './pages/Drivers/New';

    function App() {
      const [session, setSession] = useState(null);
      const [organizationName, setOrganizationName] = useState('Loading...');
      const [userName, setUserName] = useState('John Doe');
      // Removed isSidebarOpen state
      const [emailConfirmed, setEmailConfirmed] = useState(false);
      const [userRole, setUserRole] = useState(null);

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
      }, []);

      useEffect(() => {
        const fetchOrganizationName = async () => {
          try {
            if (session?.user?.id) {
              const { data: user, error } = await supabase
                .from('users')
                .select('organization_id, name, role')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching user:', error);
                setOrganizationName('Error');
                return;
              }

              if (user && user.organization_id) {
                const { data: organization, error: orgError } = await supabase
                  .from('organizations')
                  .select('name')
                  .eq('id', user.organization_id)
                  .single();

                if (orgError) {
                  console.error('Error fetching organization:', orgError);
                  setOrganizationName('Error');
                  return;
                }

                if (organization && organization.name) {
                  setOrganizationName(organization.name);
                } else {
                  setOrganizationName('Organization Not Found');
                }
                setUserName(user.name || '');
                setUserRole(user.role || 'user');
              } else {
                setOrganizationName('');
                setUserRole('user');
              }
            } else {
              setOrganizationName('');
              setUserRole('user');
            }
          } catch (error) {
            console.error('Unexpected error:', error);
            setOrganizationName('Error');
            setUserRole('user');
          }
        };

        fetchOrganizationName();
      }, [session]);

      useEffect(() => {
        if (session?.user?.email_confirmed_at) {
          setEmailConfirmed(true);
        } else {
          setEmailConfirmed(false);
        }
      }, [session]);

      useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);

        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        document.head.appendChild(fontLink);
      }, []);

      const isAdmin = userRole === 'admin';
      const sidebarWidth = '256px'; // Define sidebar width (64 * 4 = 256px for w-64)

      return (
        <>
          <BrowserRouter>
            {session ? (
              <div className="flex h-screen bg-gray-100">
                {/* Removed isSidebarOpen and setIsSidebarOpen props */}
                <Sidebar session={session} userRole={userRole} />

                {/* Use fixed margin based on expanded sidebar width */}
                <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
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

                  <main className="bg-gray-100 p-6 overflow-y-auto"> {/* Added overflow-y-auto */}
                    <Routes>
                      <Route
                        path="/"
                        element={
                          session ? (
                            <Navigate to="/activities" replace />
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
                        path="/activities"
                        element={<Activities />}
                      />
                      <Route
                        path="/activities/new"
                        element={<NewActivity />}
                      />
                      <Route
                        path="/activities/:id"
                        element={<ActivityRecord />}
                      />
                      {isAdmin && (
                        <>
                          <Route
                            path="/vehicles"
                            element={<Vehicles />}
                          />
                          <Route
                            path="/vehicles/new"
                            element={<NewVehicle />}
                          />
                        </>
                      )}
                      <Route
                        path="/vehicles/:id"
                        element={<VehicleRecord />}
                      />
                      {isAdmin && (
                        <>
                          <Route
                            path="/drivers"
                            element={<Drivers />}
                          />
                          <Route
                            path="/drivers/new"
                            element={<NewDriver />}
                          />
                          <Route
                            path="/drivers/:id"
                            element={<DriverRecord />}
                          />
                          <Route
                            path="/dashboard"
                            element={<Dashboard />}
                          />
                          <Route
                            path="/admin"
                            element={
                              emailConfirmed ? (
                                <Admin />
                              ) : (
                                <Navigate to="/confirmation" replace />
                              )
                            }
                          />
                        </>
                      )}
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
      );
    }

    export default App;
