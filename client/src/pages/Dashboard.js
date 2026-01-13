import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [regionalStats, setRegionalStats] = useState({
    guatemala: { totalUsers: 0, activeClients: 0, lastMonthActiveClients: 0, totalCommissions: 0 },
    honduras: { totalUsers: 0, activeClients: 0, lastMonthActiveClients: 0, totalCommissions: 0 },
    elsalvador: { totalUsers: 0, activeClients: 0, lastMonthActiveClients: 0, totalCommissions: 0 },
    costarica: { totalUsers: 0, activeClients: 0, lastMonthActiveClients: 0, totalCommissions: 0 }
  });
  const [loading, setLoading] = useState(true);

  const countries = [
    { key: 'guatemala', name: 'Guatemala', flag: '🇬🇹' },
    { key: 'honduras', name: 'Honduras', flag: '🇭🇳' },
    { key: 'elsalvador', name: 'El Salvador', flag: '🇸🇻' },
    { key: 'costarica', name: 'Costa Rica', flag: '🇨🇷' }
  ];

  useEffect(() => {
    fetchRegionalStats();
  }, []);

  const fetchRegionalStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/regional-stats');
      setRegionalStats(response.data);
    } catch (error) {
      console.warn('Regional stats endpoint not available yet, using mock data:', error.message);
      // Mock data for demonstration
      setRegionalStats({
        guatemala: { 
          totalUsers: 150, 
          activeClients: 1200, 
          lastMonthActiveClients: 1000, 
          totalCommissions: 15000 
        },
        honduras: { 
          totalUsers: 80, 
          activeClients: 600, 
          lastMonthActiveClients: 550, 
          totalCommissions: 8000 
        },
        elsalvador: { 
          totalUsers: 200, 
          activeClients: 1800, 
          lastMonthActiveClients: 1600, 
          totalCommissions: 22000 
        },
        costarica: { 
          totalUsers: 60, 
          activeClients: 400, 
          lastMonthActiveClients: 380, 
          totalCommissions: 5000 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const CountryCard = ({ country }) => {
    const stats = regionalStats[country.key];
    const growthPercentage = calculateGrowthPercentage(stats.activeClients, stats.lastMonthActiveClients);
    const isGrowth = growthPercentage >= 0;

    return (
      <div className="card p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">{country.flag}</span>
            {country.name}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Clientes Activos Mes</p>
            <p className="text-xl font-bold text-blue-600">{stats.activeClients}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
            <p className="text-xl font-bold text-green-600">${stats.totalCommissions.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
            <div className="flex items-center">
              {isGrowth ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-xl font-bold ${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
                {isGrowth ? '+' : ''}{growthPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getUserCountryStats = () => {
    if (!user?.country) return null;
    return regionalStats[user.country];
  };

  const getUserCountryInfo = () => {
    if (!user?.country) return null;
    return countries.find(c => c.key === user.country);
  };

  const getTotalStats = () => {
    return countries.reduce((acc, country) => {
      const stats = regionalStats[country.key];
      return {
        totalUsers: acc.totalUsers + stats.totalUsers,
        activeClients: acc.activeClients + stats.activeClients,
        totalCommissions: acc.totalCommissions + stats.totalCommissions
      };
    }, { totalUsers: 0, activeClients: 0, totalCommissions: 0 });
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const userCountryStats = getUserCountryStats();
  const userCountryInfo = getUserCountryInfo();

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
          {isSuperAdmin 
            ? 'Panel de control regional del sistema de comisiones.'
            : `Panel de control - ${userCountryInfo?.name || 'Sistema de comisiones'}`
          }
        </p>
      </div>

      {/* Stats Section */}
      {isSuperAdmin ? (
        // Super Admin: Ver todas las estadísticas globales y regionales
        <>
          {/* Global Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-blue-600">{getTotalStats().totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="card p-6 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <p className="text-3xl font-bold text-green-600">{getTotalStats().activeClients}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="card p-6 bg-purple-50 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
                  <p className="text-3xl font-bold text-purple-600">${getTotalStats().totalCommissions.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="card p-6 bg-orange-50 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa Activación</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {getTotalStats().totalUsers > 0 
                      ? ((getTotalStats().activeClients / getTotalStats().totalUsers) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Regional Stats */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas por País</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {countries.map(country => (
                <CountryCard key={country.key} country={country} />
              ))}
            </div>
          </div>
        </>
      ) : (
        // Regular User: Ver solo estadísticas de su país
        userCountryStats && userCountryInfo && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">{userCountryInfo.flag}</span>
              Estadísticas - {userCountryInfo.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-3xl font-bold text-blue-600">{userCountryStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="card p-6 bg-green-50 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
                    <p className="text-3xl font-bold text-green-600">${userCountryStats.totalCommissions.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="card p-6 bg-purple-50 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                    <p className="text-3xl font-bold text-purple-600">{userCountryStats.activeClients}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="card p-6 bg-orange-50 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
                    <div className="flex items-center">
                      {(() => {
                        const growth = calculateGrowthPercentage(userCountryStats.activeClients, userCountryStats.lastMonthActiveClients);
                        const isGrowth = growth >= 0;
                        return (
                          <>
                            {isGrowth ? (
                              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-red-500 mr-2" />
                            )}
                            <p className={`text-3xl font-bold ${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
                              {isGrowth ? '+' : ''}{growth}%
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
