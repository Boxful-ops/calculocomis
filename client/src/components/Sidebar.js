import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  Home, 
  Users, 
  DollarSign, 
  UserCheck,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Gestión de Usuarios', adminOnly: true },
    { path: '/commissions', icon: DollarSign, label: 'Comisiones' },
    { path: '/clients', icon: UserCheck, label: 'Clientes' },
  ];

  const handleNavigation = (path) => {
    if (path.startsWith('/')) {
      navigate(path);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'super_admin') {
      return false;
    }
    return true;
  });

  return (
    <div className="sidebar w-64 text-white p-4 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Sistema de Comisiones</h1>
        <p className="text-sm opacity-80">Gestión Integral</p>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/20 pt-4 mt-4">
        <div className="mb-4">
          <p className="font-semibold">{user?.username || 'Usuario'}</p>
          <p className="text-sm opacity-80">
            {user?.role === 'super_admin' ? 'Super Administrador' : 
             user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <button
          onClick={logout}
          className="nav-item w-full justify-center hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
