import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Users, Search, Filter, Download, Eye, Calendar, MapPin, Phone, Mail, Globe, ChevronDown, Upload, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ClientManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [filter, setFilter] = useState({
    status: 'all',
    country: 'all',
    seller: 'all',
    month: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const countries = [
    { key: 'guatemala', name: '🇬🇹 Guatemala' },
    { key: 'honduras', name: '🇭🇳 Honduras' },
    { key: 'elsalvador', name: '🇸🇻 El Salvador' },
    { key: 'costarica', name: '🇨🇷 Costa Rica' }
  ];

  const months = [
    { value: 'all', label: 'Todos los meses' },
    { value: '2024-01', label: 'Enero 2024' },
    { value: '2024-02', label: 'Febrero 2024' },
    { value: '2024-03', label: 'Marzo 2024' },
    { value: '2024-04', label: 'Abril 2024' },
    { value: '2024-05', label: 'Mayo 2024' },
    { value: '2024-06', label: 'Junio 2024' },
    { value: '2024-07', label: 'Julio 2024' },
    { value: '2024-08', label: 'Agosto 2024' },
    { value: '2024-09', label: 'Septiembre 2024' },
    { value: '2024-10', label: 'Octubre 2024' },
    { value: '2024-11', label: 'Noviembre 2024' },
    { value: '2024-12', label: 'Diciembre 2024' },
    { value: '2025-01', label: 'Enero 2025' }
  ];

  useEffect(() => {
    fetchClients(1); // Reset to page 1 when filters change
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      fetchSellers();
    }
  }, [filter, searchTerm, user]);

  const fetchClients = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        status: filter.status !== 'all' ? filter.status : '',
        country: filter.country !== 'all' ? filter.country : '',
        seller: filter.seller !== 'all' ? filter.seller : '',
        month: filter.month !== 'all' ? filter.month : '',
        search: searchTerm
      });

      const response = await axios.get(`/api/clients?${params}`);
      
      if (append) {
        setClients(prev => [...prev, ...response.data.clients]);
      } else {
        setClients(response.data.clients);
      }
      
      setPagination(response.data.pagination);
    } catch (error) {
      console.warn('Clients endpoint error, using mock data:', error.message);
      console.log('Loading mock clients data...');
      // Mock data for demonstration
      let mockClients = Array.from({ length: 50 }, (_, i) => ({
        _id: `client_${i + 1}`,
        name: `Cliente ${i + 1}`,
        email: `cliente${i + 1}@email.com`,
        phone: `+502 1234-${String(i + 1).padStart(4, '0')}`,
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
        country: ['guatemala', 'honduras', 'elsalvador', 'costarica'][Math.floor(Math.random() * 4)],
        sellerId: { username: user?.role === 'seller' ? user.username : `Vendedor ${Math.floor(Math.random() * 5) + 1}` },
        totalCommissions: Math.floor(Math.random() * 1000),
        firstShipmentDate: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString()
      }));

      // Apply filters to mock data
      if (filter.status !== 'all') {
        mockClients = mockClients.filter(client => client.status === filter.status);
      }
      if (filter.country !== 'all') {
        mockClients = mockClients.filter(client => client.country === filter.country);
      }
      if (filter.seller !== 'all') {
        mockClients = mockClients.filter(client => client.sellerId?.username === filter.seller);
      }
      if (filter.month !== 'all') {
        mockClients = mockClients.filter(client => {
          const clientMonth = new Date(client.createdAt).toISOString().slice(0, 7);
          return clientMonth === filter.month;
        });
      }
      if (searchTerm) {
        mockClients = mockClients.filter(client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.phone && client.phone.includes(searchTerm))
        );
      }

      console.log('Setting mock clients:', mockClients.length);
      if (append) {
        setClients(prev => [...prev, ...mockClients]);
      } else {
        setClients(mockClients);
      }
      
      setPagination({
        page: page,
        limit: 50,
        total: 1000,
        totalPages: 20
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreClients = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) {
      fetchClients(pagination.page + 1, true);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get('/api/users/sellers');
      setSellers(response.data);
    } catch (error) {
      console.warn('Sellers endpoint not available yet:', error.message);
      // Set empty sellers array to prevent crashes
      setSellers([]);
    }
  };

  const calculateStats = () => {
    const total = pagination.total;
    const active = clients.filter(c => c.status === 'active').length;
    const newThisMonth = clients.filter(c => {
      const clientMonth = new Date(c.createdAt).toISOString().slice(0, 7);
      const currentMonth = new Date().toISOString().slice(0, 7);
      return clientMonth === currentMonth;
    }).length;
    const withCommissions = clients.filter(c => c.totalCommissions > 0).length;

    return { total, active, newThisMonth, withCommissions };
  };

  const stats = calculateStats();

  const statusColors = {
    active: 'badge-success',
    inactive: 'badge-secondary',
    pending: 'badge-warning',
    suspended: 'badge-danger'
  };

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    suspended: 'Suspendido'
  };

  const calculateClientStatus = (client) => {
    // If client has lastShipmentDate, use 45-day rule
    if (client.lastShipmentDate) {
      const lastShipment = new Date(client.lastShipmentDate);
      const today = new Date();
      const daysSinceLastShipment = Math.floor((today - lastShipment) / (1000 * 60 * 60 * 24));
      
      return daysSinceLastShipment >= 45 ? 'inactive' : 'active';
    }
    
    // Fallback to existing status field
    return client.status || 'pending';
  };

  const getAvailableCountries = () => {
    if (user?.role === 'super_admin') {
      return countries;
    } else if (user?.role === 'admin') {
      return countries.filter(c => c.key === user.country);
    }
    return [];
  };

  const getAvailableSellers = () => {
    if (user?.role === 'super_admin') {
      return sellers;
    } else if (user?.role === 'admin') {
      return sellers.filter(s => s.country === user.country);
    }
    return [];
  };

  const canViewCountryFilter = user?.role === 'super_admin' || user?.role === 'admin';
  const canViewSellerFilter = user?.role === 'super_admin' || user?.role === 'admin';

  const exportToCSV = () => {
    const csvContent = [
      ['Nombre', 'Email', 'Teléfono', 'País', 'Vendedor', 'Estado', 'Fecha de Registro', 'Fecha de Primer Envío'],
      ...clients.map(client => [
        client.name,
        client.email,
        client.phone || 'N/A',
        countries.find(c => c.key === client.country)?.name || 'N/A',
        client.sellerId?.username || 'N/A',
        statusLabels[client.status],
        new Date(client.createdAt).toLocaleDateString('es-ES'),
        client.firstShipmentDate ? new Date(client.firstShipmentDate).toLocaleDateString('es-ES') : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    try {
      const response = await axios.post('/api/clients/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert(`Archivo ${fileType.toUpperCase()} procesado exitosamente: ${response.data.message}`);
      event.target.value = '';
      
      // Refresh clients data after upload
      fetchClients(1);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error al procesar archivo: ${error.response?.data?.message || 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  const exportToXLS = () => {
    const ws = XLSX.utils.json_to_sheet([
      ['Nombre', 'Email', 'Teléfono', 'País', 'Vendedor', 'Estado', 'Fecha de Registro', 'Fecha de Primer Envío'],
      ...clients.map(client => [
        client.name,
        client.email,
        client.phone || 'N/A',
        countries.find(c => c.key === client.country)?.name || 'N/A',
        client.sellerId?.username || 'N/A',
        statusLabels[client.status],
        new Date(client.createdAt).toLocaleDateString('es-ES'),
        client.firstShipmentDate ? new Date(client.firstShipmentDate).toLocaleDateString('es-ES') : 'N/A'
      ])
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    
    // Generar el archivo XLS
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Crear blob y descargar
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
  };

  const viewClientDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  // Remove client-side filtering, assuming API handles searchTerm
  // const filteredClients = clients.filter(client =>
  //   client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   (client.phone && client.phone.includes(searchTerm))
  // );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Gestión de Clientes
          </h2>
          <p className="text-gray-600 mt-1">
            {user?.role === 'seller' 
              ? 'Tus clientes' 
              : user?.role === 'admin'
              ? `Clientes - ${countries.find(c => c.key === user.country)?.name}`
              : 'Todos los clientes'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
          <button
            onClick={exportToXLS}
            className="btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Importar Clientes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Subir Archivo CSV</h4>
            <p className="text-gray-600 mb-4">
              Sube un archivo CSV con los datos de clientes para importarlos al sistema.
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
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click para seleccionar archivo CSV</p>
                <p className="text-sm text-gray-500 mt-1">o arrastra el archivo aquí</p>
              </label>
            </div>
            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Procesando archivo...</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Subir Archivo Excel</h4>
            <p className="text-gray-600 mb-4">
              Sube un archivo Excel (.xlsx) con los datos de clientes para importarlos al sistema.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'excel')}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click para seleccionar archivo Excel</p>
                <p className="text-sm text-gray-500 mt-1">o arrastra el archivo aquí</p>
              </label>
            </div>
            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Procesando archivo...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {stats.active}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nuevos este Mes</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {stats.newThisMonth}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Comisiones</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {stats.withCommissions}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-50">
              <Filter className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="input-field"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          {canViewCountryFilter && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por País
              </label>
              <select
                value={filter.country}
                onChange={(e) => setFilter({...filter, country: e.target.value, seller: 'all'})}
                className="input-field"
              >
                <option value="all">Todos los países</option>
                {getAvailableCountries().map(country => (
                  <option key={country.key} value={country.key}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canViewSellerFilter && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Vendedor
              </label>
              <select
                value={filter.seller}
                onChange={(e) => setFilter({...filter, seller: e.target.value})}
                className="input-field"
              >
                <option value="all">Todos los vendedores</option>
                {getAvailableSellers().map(seller => (
                  <option key={seller._id} value={seller._id}>
                    {seller.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Mes
            </label>
            <select
              value={filter.month}
              onChange={(e) => setFilter({...filter, month: e.target.value})}
              className="input-field"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                {(user?.role === 'super_admin' || user?.role === 'admin') && <th>Vendedor</th>}
                {(user?.role === 'super_admin') && <th>País</th>}
                <th>Estado</th>
                <th>Fecha de Registro</th>
                <th>Fecha de Primer Envío</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'super_admin' ? 8 : user?.role === 'admin' ? 7 : 6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'super_admin' ? 8 : user?.role === 'admin' ? 7 : 6} className="text-center py-8 text-gray-500">
                    {searchTerm || filter.status !== 'all' || filter.country !== 'all' || filter.seller !== 'all' || filter.month !== 'all'
                      ? 'No se encontraron clientes con los filtros aplicados'
                      : 'No hay clientes registrados'
                    }
                  </td>
                </tr>
              ) : (
                clients.map((client, index) => {
                  const clientStatus = calculateClientStatus(client);
                  return (
                  <tr key={client._id || `client_${index}`} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.company}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    {(user?.role === 'super_admin' || user?.role === 'admin') && (
                      <td>{client.sellerId?.username || 'N/A'}</td>
                    )}
                    {(user?.role === 'super_admin') && (
                      <td>{countries.find(c => c.key === client.country)?.name || 'N/A'}</td>
                    )}
                    <td>
                      <span className={`badge ${statusColors[clientStatus]}`}>
                        {statusLabels[clientStatus]}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p>{new Date(client.createdAt).toLocaleDateString('es-ES')}</p>
                        <p className="text-gray-500">
                          {new Date(client.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {client.firstShipmentDate ? (
                          <>
                            <p>{new Date(client.firstShipmentDate).toLocaleDateString('es-ES')}</p>
                            <p className="text-gray-500">
                              {new Date(client.firstShipmentDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400">Sin envíos</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => viewClientDetails(client)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {!loading && clients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{clients.length}</span> de{' '}
                <span className="font-medium">{pagination.total}</span> clientes
                {pagination.total > pagination.limit && (
                  <span className="ml-2">
                    (Página {pagination.page} de {pagination.totalPages})
                  </span>
                )}
              </div>
              
              {pagination.page < pagination.totalPages && (
                <button
                  onClick={loadMoreClients}
                  disabled={loadingMore}
                  className="btn-primary flex items-center"
                >
                  {loadingMore ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  Cargar más
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalles del Cliente</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <p className="text-gray-900">{selectedClient.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedClient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="text-gray-900">{selectedClient.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <span className={`badge ${statusColors[selectedClient.status]}`}>
                    {statusLabels[selectedClient.status]}
                  </span>
                </div>
                {(user?.role === 'super_admin' || user?.role === 'admin') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                      <p className="text-gray-900">{selectedClient.sellerId?.username || 'N/A'}</p>
                    </div>
                    {(user?.role === 'super_admin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <p className="text-gray-900">
                          {countries.find(c => c.key === selectedClient.country)?.name || 'N/A'}
                        </p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                  <p className="text-gray-900">
                    {new Date(selectedClient.createdAt).toLocaleDateString('es-ES')} {' '}
                    {new Date(selectedClient.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Primer Envío</label>
                  <p className="text-gray-900">
                    {selectedClient.firstShipmentDate ? 
                      new Date(selectedClient.firstShipmentDate).toLocaleDateString('es-ES') 
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comisiones Totales</label>
                  <p className="text-gray-900 font-semibold">
                    ${selectedClient.totalCommissions?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              
              {selectedClient.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <p className="text-gray-900">{selectedClient.address}</p>
                </div>
              )}
              
              {selectedClient.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <p className="text-gray-900">{selectedClient.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
