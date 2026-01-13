import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  History, 
  UserCheck,
  Bell,
  LogOut,
  Package,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Gestión de Usuarios', adminOnly: true },
    { path: '/commissions', icon: DollarSign, label: 'Comisiones' },
    { path: '/hubspot', icon: Users, label: 'Integración HubSpot', adminOnly: true },
    { path: '/shipments', icon: Package, label: 'Nueva Entrada' },
    { path: 'new-exit', icon: FileText, label: 'Nueva Salida' },
    { path: '/orders', icon: FileText, label: 'Mis Órdenes' },
    { path: '/sales-report', icon: TrendingUp, label: 'Reporte de Ventas' },
    { path: '/order-history', icon: History, label: 'Historial de Órdenes' },
    { path: '/clients', icon: UserCheck, label: 'Clientes' },
    { path: '/reminders', icon: Bell, label: 'Recordatorios' },
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
    <div className="sidebar w-64 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Sistema de Comisiones</h1>
        <p className="text-sm opacity-80">Gestión Integral</p>
      </div>

      <nav className="space-y-2">
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

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <div className="mb-4">
          <p className="font-semibold">{user?.username || 'Usuario'}</p>
          <p className="text-sm opacity-80">
            {user?.role === 'super_admin' ? 'Super Administrador' : 
             user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <button
          onClick={logout}
          className="nav-item w-full justify-center"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
