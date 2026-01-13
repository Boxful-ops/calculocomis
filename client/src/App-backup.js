import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componente Login simple
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de login
    if (email === 'admin@demo.com' && password === 'admin123') {
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'admin',
        email: 'admin@demo.com',
        role: 'super_admin'
      }));
      window.location.reload();
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Sistema de Comisiones
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="•••••••••"
              required
            />
          </div>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>Credenciales de prueba:</p>
          <p style={{ fontFamily: 'monospace', marginTop: '5px' }}>
            admin@demo.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard simple
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalCommissions: 0
  });

  useEffect(() => {
    // Simulación de datos
    setStats({
      totalUsers: 5,
      totalLeads: 25,
      totalCommissions: 1250.50
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>
        Bienvenido Administrador
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Total Usuarios</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalUsers}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Total Leads</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {stats.totalLeads}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Comisiones Totales</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            ${stats.totalCommissions.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Funcionalidades del Sistema
        </h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ Gestión de usuarios y permisos</li>
          <li>✅ Cálculo automático de comisiones</li>
          <li>✅ Procesamiento de archivos CSV y XLS</li>
          <li>✅ Integración con HubSpot</li>
          <li>✅ Dashboard en tiempo real</li>
          <li>✅ Reportes y estadísticas</li>
        </ul>
      </div>
    </div>
  );
};

// Componente principal
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px'
        }}>
          <h2 style={{ marginBottom: '30px' }}>Sistema</h2>
          <nav>
            <div style={{ 
              padding: '12px 0', 
              cursor: 'pointer',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              marginBottom: '10px'
            }}>
              📊 Dashboard
            </div>
            <div style={{ 
              padding: '12px 0', 
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              👥 Usuarios
            </div>
            <div style={{ 
              padding: '12px 0', 
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              💰 Comisiones
            </div>
            <div style={{ 
              padding: '12px 0', 
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              🔗 HubSpot
            </div>
          </nav>
          
          <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
            <p style={{ marginBottom: '10px' }}>{user.username}</p>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
