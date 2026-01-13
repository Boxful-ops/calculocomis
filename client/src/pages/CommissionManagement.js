import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import axios from 'axios';

const CommissionManagement = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchCommissions();
  }, [filter, month]);

  const fetchCommissions = async () => {
    try {
      const response = await axios.get('/api/commissions');
      let filteredData = response.data;

      if (filter !== 'all') {
        filteredData = filteredData.filter(commission => commission.status === filter);
      }

      setCommissions(filteredData);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = commissions.reduce((sum, commission) => sum + commission.totalCommission, 0);
    const fullCommission = commissions.filter(c => c.status === 'full').reduce((sum, c) => sum + c.totalCommission, 0);
    const halfCommission = commissions.filter(c => c.status === 'half').reduce((sum, c) => sum + c.totalCommission, 0);
    const nextMonth = commissions.filter(c => c.status === 'next_month').reduce((sum, c) => sum + c.totalCommission, 0);

    return { total, fullCommission, halfCommission, nextMonth };
  };

  const stats = calculateStats();

  const statusColors = {
    full: 'badge-success',
    half: 'badge-warning',
    next_month: 'badge-info'
  };

  const statusLabels = {
    full: 'Completa',
    half: 'Mitad',
    next_month: 'Siguiente Mes'
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Cliente', 'Mes', 'Año', 'Envíos', 'Tasa de Comisión', 'Comisión Total', 'Estado'],
      ...commissions.map(commission => [
        commission.leadId?.name || 'N/A',
        commission.month,
        commission.year,
        commission.shipments,
        commission.commissionRate,
        commission.totalCommission,
        statusLabels[commission.status]
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions_${month}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Gestión de Comisiones
          </h2>
          <p className="text-gray-600 mt-1">Administra y calcula las comisiones de los leads</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comisión Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.total.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comisión Completa</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${stats.fullCommission.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comisión Mitad</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                ${stats.halfCommission.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Siguiente Mes</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${stats.nextMonth.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="full">Completa</option>
              <option value="half">Mitad</option>
              <option value="next_month">Siguiente Mes</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes y Año
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Commission Rules */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reglas de Comisión</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Primer Mes</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• $1 por envío</li>
              <li>• Tiers: $5, $30, $100, $300</li>
              <li>• Si se afilia el día 21 o después: comisión para el siguiente mes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Segundo Mes</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• $0.50 por envío</li>
              <li>• Tiers: $2.50, $15, $50, $150</li>
              <li>• Aplica solo durante el segundo mes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Mes</th>
                <th>Año</th>
                <th>Envíos</th>
                <th>Tasa</th>
                <th>Comisión Total</th>
                <th>Tier</th>
                <th>Estado</th>
                <th>Fecha de Procesamiento</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No se encontraron comisiones
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission._id}>
                    <td className="font-medium">
                      {commission.leadId?.name || 'N/A'}
                    </td>
                    <td>{commission.month}</td>
                    <td>{commission.year}</td>
                    <td>{commission.shipments}</td>
                    <td>${commission.commissionRate}</td>
                    <td className="font-semibold">
                      ${commission.totalCommission.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {commission.tier || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[commission.status]}`}>
                        {statusLabels[commission.status]}
                      </span>
                    </td>
                    <td>
                      {new Date(commission.processedAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionManagement;
