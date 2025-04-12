import React from 'react';
    import { Link, useLocation, useNavigate } from 'react-router-dom';
    import { supabase } from '../supabaseClient';

    const Sidebar = ({ userRole }) => { // Removed isSidebarOpen and setIsSidebarOpen props
      const location = useLocation();
      const navigate = useNavigate();

      const isAdmin = userRole === 'admin';

      const menuItems = [
        { path: '/activities', icon: 'event_note', label: 'Actividades' },
        { path: '/my-profile', icon: 'person', label: 'Perfil' },
        ...(isAdmin
          ? [
              { path: '/dashboard', icon: 'dashboard', label: 'Panel' },
              { path: '/vehicles', icon: 'directions_car', label: 'Vehiculos' },
              { path: '/drivers', icon: 'people', label: 'Conductores' },
              { path: '/admin', icon: 'admin_panel_settings', label: 'Administrador' },
            ]
          : [])
      ];

      const handleLogout = async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Logout error:', error.message);
            alert(error.message);
          } else {
            console.log('Logged out');
            navigate('/');
          }
        } catch (error) {
          console.error('Logout error:', error.message);
          alert(error.message);
        }
      };

      // Sidebar is always expanded, width is fixed to w-64
      return (
        <div className={`sidebar w-64 fixed inset-y-0 left-0 z-30 bg-gray-900 text-white`}> {/* Removed collapsed class logic and transition */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
            {/* Always show the title */}
            <div className="text-xl font-bold text-white">CarFleetPro</div>
            {/* Removed collapse button */}
          </div>

          <nav className="mt-5">
            <ul className="space-y-2 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200
                      ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                      justify-start`} // Always justify-start
                  >
                    <span className="material-icons">{item.icon}</span>
                    {/* Always show the label */}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className={`flex items-center text-gray-300 hover:text-white transition-colors duration-200 justify-start`} // Always justify-start
            >
              <span className="material-icons">logout</span>
              {/* Always show the label */}
              <span className="ml-3">Cerrar Sesion</span>
            </button>
          </div>
        </div>
      );
    };

    export default Sidebar;
