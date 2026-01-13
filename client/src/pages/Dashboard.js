import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Users, DollarSign, Package, TrendingUp, Upload, FileText } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalCommissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Comisiones Totales',
      value: `$${stats.totalCommissions.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Leads HubSpot',
      value: stats.hubspotMatchedLeads || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Bienvenido {user?.username || 'Usuario'}
        </h2>
        <p className="text-lg opacity-90">
          Registra los productos que ingresan a bodega de forma rápida y sencilla.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload CSV Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-purple-600" />
            Cargar Leads (CSV)
          </h3>
          <p className="text-gray-600 mb-4">
            Sube un archivo CSV con los datos de leads para calcular comisiones.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'csv')}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click para seleccionar archivo CSV</p>
              <p className="text-sm text-gray-500 mt-1">o arrastra el archivo aquí</p>
            </label>
          </div>
        </div>

        {/* Upload XLS Section */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-green-600" />
            Cargar Envíos (XLS)
          </h3>
          <p className="text-gray-600 mb-4">
            Sube un archivo XLS con los envíos del mes para procesar comisiones.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => handleFileUpload(e, 'xls')}
              className="hidden"
              id="xls-upload"
            />
            <label htmlFor="xls-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click para seleccionar archivo XLS</p>
              <p className="text-sm text-gray-500 mt-1">o arrastra el archivo aquí</p>
            </label>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Nuevo lead registrado: Juan Pérez</span>
            </div>
            <span className="text-sm text-gray-500">Hace 2 horas</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Comisión procesada: $150.00</span>
            </div>
            <span className="text-sm text-gray-500">Hace 5 horas</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Archivo CSV cargado exitosamente</span>
            </div>
            <span className="text-sm text-gray-500">Ayer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleFileUpload = async (event, fileType) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append(`${fileType}File`, file);

  try {
    const response = await axios.post(`/api/upload/${fileType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    alert(`Archivo ${fileType.toUpperCase()} procesado exitosamente`);
    event.target.value = '';
  } catch (error) {
    alert(`Error al procesar archivo: ${error.response?.data?.message || 'Error desconocido'}`);
  }
};

export default Dashboard;
