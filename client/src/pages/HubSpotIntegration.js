import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Sync, CheckCircle, AlertCircle, Users, Search } from 'lucide-react';
import axios from 'axios';

const HubSpotIntegration = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    hubspotMatched: 0,
    notMatched: 0
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats({
        totalLeads: response.data.totalLeads,
        hubspotMatched: response.data.hubspotMatchedLeads,
        notMatched: response.data.totalLeads - response.data.hubspotMatchedLeads
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await axios.post('/api/hubspot/sync');
      alert(response.data.message);
      fetchLeads();
      fetchStats();
    } catch (error) {
      alert('Error al sincronizar: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setSyncing(false);
    }
  };

  const searchLeads = async (query) => {
    if (!query) {
      fetchLeads();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/leads/search?q=${query}`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error searching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Acceso Restringido</h2>
          <p className="text-gray-500 mt-2">No tienes permisos para acceder a esta sección</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Integración con HubSpot
          </h2>
          <p className="text-gray-600 mt-1">Sincroniza y gestiona la integración con HubSpot</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center disabled:opacity-50"
        >
          <Sync className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar con HubSpot'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conectados a HubSpot</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.hubspotMatched}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Conectar</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.notMatched}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar leads..."
            onChange={(e) => searchLeads(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha de Afiliación</th>
                <th>ID HubSpot</th>
                <th>Estado</th>
                <th>Comisión Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="font-medium">{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>
                      {new Date(lead.affiliationDate).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      {lead.hubspotContactId ? (
                        <span className="badge badge-success">
                          {lead.hubspotContactId}
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          No conectado
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        lead.status === 'active' ? 'badge-success' : 
                        lead.status === 'inactive' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {lead.status === 'active' ? 'Activo' : 
                         lead.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="font-semibold">
                      ${lead.totalCommission.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Integración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Configuración Requerida</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Token de App Privada de HubSpot</li>
              <li>• Permisos de lectura de contactos</li>
              <li>• Permisos de lectura de empresas</li>
              <li>• Configuración de propiedades personalizadas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Funcionalidades</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Búsqueda automática de contactos</li>
              <li>• Sincronización bidireccional</li>
              <li>• Validación de datos</li>
              <li>• Actualización en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotIntegration;
