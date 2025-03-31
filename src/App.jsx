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
    import Sidebar from './components/Sidebar'; // Added Sidebar import
    import MyProfile from './pages/MyProfile';
    import VehicleRecord from './pages/Vehicles/[id]';
    import DriverRecord from './pages/Drivers/[id]';
    import ActivityRecord from './pages/Activities/[id]';
    import NewActivity from './pages/Activities/New';
    import NewVehicle from './pages/Vehicles/New';
    import NewDriver from './pages/Drivers/New';
    import CSVImport from './CSVImport'; // Import the new component

    function App() {
      const [session, setSession] = useState(null);
      const [organizationName, setOrganizationName] = useState('Loading...');
      const [userName, setUserName] = useState('John Doe');
      const [isSidebarOpen, setIsSidebarOpen] = useState(true);
      const [emailConfirmed, setEmailConfirmed] = useState(false);
      const [userRole, setUserRole] = useState(null); // Add userRole state

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
                .select('organization_id, name, role') // Fetch role
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
                setUserRole(user.role || 'user'); // Set userRole
              } else {
                setOrganizationName('');
                setUserRole('user'); // Default role
              }
            } else {
              setOrganizationName('');
              setUserRole('user'); // Default role
            }
          } catch (error) {
            console.error('Unexpected error:', error);
            setOrganizationName('Error');
            setUserRole('user'); // Default role
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

      const isAdmin = userRole === 'admin';

      return (
        <>
          <BrowserRouter>
            {session ? (
              <div className="flex h-screen bg-gray-100"> {/* Changed background color */}
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} session={session} userRole={userRole} /> {/* Added Sidebar */}

                <div className="flex flex-col flex-1" style={{ marginLeft: isSidebarOpen ? '256px' : '0', transition: 'margin-left 0.3s ease-in-out' }}>
                  <header className="bg-gray-100 shadow h-16 flex items-center justify-between px-6 border-b border-gray-200"> {/* Improved styling */}
                    <div>
                      <span className="text-gray-800 text-base font-medium"> {/* Improved styling */}
                        {organizationName}
                      </span>
                    </div>
                    <button className="text-gray-800 focus:outline-none text-base font-medium"> {/* Improved styling */}
                      {userName}
                    </button>
                  </header>

                  <main className="bg-gray-100 p-6"> {/*Improved styling */}
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
                      <Route path="/import" element={<CSVImport />} /> {/* Add the new route */}
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
