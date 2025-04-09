import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';
import Navbar from "../components/Nav"

const token = localStorage.getItem("authGimToken");
const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const [dateRange, setDateRange] = useState({
    startDate: startOfDay,
    endDate: endOfDay
  });
  

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://onixgym.online/api/api/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setClients(data);
        setError(null);
      } catch (err) {
        setError(`Error al obtener datos: ${err.message}`);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para filtrar clientes por rango de fechas
  const filterClientsByDateRange = (clients, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return clients.filter(client => {
      // Convertir createdAt a fecha
      const createdDate = new Date(client.createdAt);
      
      // Verificar si el cliente fue creado dentro del rango de fechas
      return createdDate >= start && createdDate <= end;
    });
  };

  // Función para procesar los datos y generar estadísticas
  const processData = (allClients) => {
    if (!allClients || allClients.length === 0) {
      return {
        totalClients: 0,
        newClients: 0,
        activeMembers: 0,
        totalRevenue: 0,
        checkIns: 0,
        membershipDistribution: [],
        revenueByDay: [],
        checkInsByDay: []
      };
    }

    // Filtrar clientes por rango de fechas
    const filteredClients = filterClientsByDateRange(
      allClients, 
      dateRange.startDate, 
      dateRange.endDate
    );
    
    // Calcular estadísticas básicas
    const totalClients = allClients.length;
    const newClients = filteredClients.length;
    
    // Calcular miembros activos (con membresía vigente)
    const now = new Date();
    const activeMembers = allClients.filter(client => {
      return client.membership && client.membership.some(membership => {
        const finishDate = new Date(membership.finishDate);
        return finishDate >= now;
      });
    }).length;
    
    // Calcular ingresos totales de las membresías en el rango de fechas
    let totalRevenue = 0;
    allClients.forEach(client => {
      if (client.membership) {
        client.membership.forEach(membership => {
          const initDate = new Date(membership.initDate);
          if (initDate >= new Date(dateRange.startDate) && initDate <= new Date(dateRange.endDate)) {
            totalRevenue += membership.amount;
          }
        });
      }
    });
    
    // Contar check-ins en el rango de fechas
    let totalCheckIns = 0;
    allClients.forEach(client => {
      if (client.checkins) {
        client.checkins.forEach(checkin => {
          const checkInDate = new Date(checkin.checkInDate);
          if (checkInDate >= new Date(dateRange.startDate) && checkInDate <= new Date(dateRange.endDate)) {
            totalCheckIns++;
          }
        });
      }
    });
    
    // Agrupar membresías por tipo
    const membershipTypes = {};
    allClients.forEach(client => {
      if (client.membership) {
        client.membership.forEach(membership => {
          const type = membership.name || 'Sin clasificar';
          membershipTypes[type] = (membershipTypes[type] || 0) + 1;
        });
      }
    });
    
    const membershipDistribution = Object.entries(membershipTypes).map(([name, value]) => ({
      name,
      value
    }));
    
    // Agrupar ingresos por día
    const revenueByDay = {};
    allClients.forEach(client => {
      if (client.membership) {
        client.membership.forEach(membership => {
          const initDate = new Date(membership.initDate);
          if (initDate >= new Date(dateRange.startDate) && initDate <= new Date(dateRange.endDate)) {
            const dateStr = initDate.toISOString().split('T')[0];
            revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + membership.amount;
          }
        });
      }
    });
    
    const revenueByDayArray = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Agrupar check-ins por día
    const checkInsByDay = {};
    allClients.forEach(client => {
      if (client.checkins) {
        client.checkins.forEach(checkin => {
          const checkInDate = new Date(checkin.checkInDate);
          if (checkInDate >= new Date(dateRange.startDate) && checkInDate <= new Date(dateRange.endDate)) {
            const dateStr = checkInDate.toISOString().split('T')[0];
            checkInsByDay[dateStr] = (checkInsByDay[dateStr] || 0) + 1;
          }
        });
      }
    });
    
    const checkInsByDayArray = Object.entries(checkInsByDay).map(([date, checkIns]) => ({
      date,
      checkIns
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      totalClients,
      newClients,
      activeMembers,
      totalRevenue,
      checkIns: totalCheckIns,
      membershipDistribution,
      revenueByDay: revenueByDayArray,
      checkInsByDay: checkInsByDayArray
    };
  };

  const data = processData(clients);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold text-gray-700">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-semibold text-red-600 mb-4">Error</div>
        <div className="text-gray-700">{error}</div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Si estás viendo esto en un entorno de desarrollo, es posible que tengas problemas de CORS.</p>
          <p className="text-sm text-gray-500">Asegúrate de que la API permita solicitudes desde este origen.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="flex flex-col p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard de Mi Gimnasio</h1>
      
      {/* Selector de fechas */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Rango de Fechas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Fecha de inicio:</label>
            <input
              type="datetime-local"
              name="startDate"
              value={dateRange.startDate.slice(0, 16)}
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Fecha de fin:</label>
            <input
              type="datetime-local"
              name="endDate"
              value={dateRange.endDate.slice(0, 16)}
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Indicadores Clave</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-blue-700 font-semibold">Total Clientes</h3>
            <p className="text-3xl font-bold">{data.totalClients}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-green-700 font-semibold">Clientes Nuevos</h3>
            <p className="text-3xl font-bold">{data.newClients}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="text-yellow-700 font-semibold">Miembros Activos</h3>
            <p className="text-3xl font-bold">{data.activeMembers}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-md">
            <h3 className="text-purple-700 font-semibold">Ingresos Totales</h3>
            <p className="text-3xl font-bold">${data.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-red-700 font-semibold">Check-ins</h3>
            <p className="text-3xl font-bold">{data.checkIns}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos por Día */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ingresos por Día</h2>
          {data.revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Ingresos ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de ingresos para el rango de fechas seleccionado
            </div>
          )}
        </div>
        
        {/* Gráfico de Check-ins por Día */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Check-ins por Día</h2>
          {data.checkInsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.checkInsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkIns" fill="#82ca9d" name="Número de Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de check-ins para el rango de fechas seleccionado
            </div>
          )}
        </div>
        
        {/* Gráfico de Tipos de Membresías */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Distribución de Membresías</h2>
          {data.membershipDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.membershipDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de membresías disponibles
            </div>
          )}
        </div>
        
        {/* Gráfico de actividad de clientes */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Frecuencia de Visitas por Cliente</h2>
          {clients.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={clients
                  .filter(client => client.checkins && client.checkins.length > 0)
                  .map(client => ({
                    name: `${client.name} ${client.lastname}`.substring(0, 15),
                    visits: client.checkins.filter(checkin => {
                      const checkInDate = new Date(checkin.checkInDate);
                      return checkInDate >= new Date(dateRange.startDate) && 
                             checkInDate <= new Date(dateRange.endDate);
                    }).length
                  }))
                  .sort((a, b) => b.visits - a.visits)
                  .slice(0, 10)
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#8884d8" name="Número de Visitas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de actividad de clientes disponibles
            </div>
          )}
        </div>
      </div>
      
      {/* Análisis detallado de clientes */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Análisis de Clientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Nombre</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Fecha Registro</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Membresías</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Valor Total</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Vence</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold">Check-ins</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(client => {
                  // Calcular el valor total de todas las membresías del cliente
                  const totalValue = client.membership
                    ? client.membership.reduce((sum, m) => sum + m.amount, 0)
                    : 0;
                  
                  // Encontrar la fecha de vencimiento más lejana
                  const latestExpiry = client.membership && client.membership.length > 0
                    ? new Date(Math.max(...client.membership.map(m => new Date(m.finishDate).getTime())))
                    : null;
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">{`${client.name} ${client.lastname}`}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{client.membership ? client.membership.length : 0}</td>
                      <td className="py-2 px-4 border-b border-gray-200">${totalValue.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {latestExpiry ? latestExpiry.toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">{client.checkins ? client.checkins.length : 0}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;