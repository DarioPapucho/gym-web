import React, { useState, useEffect } from "react";
import Navbar from "../components/Nav";
import { format, addDays , subWeeks, subMonths } from "date-fns";

function Dashboard() {
  const [statistics, setStatistics] = useState({
    newClientsCount: 0,
    newMembershipsCount: 0,
    activeMembershipsCount: 0,
    totalIncome: 0,
    startDate: "",
    endDate: ""
  });

  const [dateFilter, setDateFilter] = useState("day");
  const [customDates, setCustomDates] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd")
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async (startDate, endDate) => {
    try {
      setLoading(true);
      const adjustedEndDate = format(addDays(new Date(endDate), 2), "yyyy-MM-dd");

      // Usar directamente el endDate sin ajuste
      const response = await fetch(
        `http://20.197.229.78:5202/api/clients/statistics?StartDate=${startDate}&EndDate=${adjustedEndDate}`
      );
      
      if (!response.ok) {
        throw new Error("Error al obtener estadísticas");
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    
    const today = new Date();
    let startDate;
    
    switch (filter) {
      case "day":
        startDate = format(today, "yyyy-MM-dd");
        break;
      case "week":
        startDate = format(subWeeks(today, 1), "yyyy-MM-dd");
        break;
      case "month":
        startDate = format(subMonths(today, 1), "yyyy-MM-dd");
        break;
      case "semester":
        startDate = format(subMonths(today, 6), "yyyy-MM-dd");
        break;
      case "year":
        startDate = format(subMonths(today, 12), "yyyy-MM-dd");
        break;
      default:
        startDate = format(today, "yyyy-MM-dd");
    }
    
    const endDate = format(today, "yyyy-MM-dd");
    
    if (filter !== "custom") {
      fetchStatistics(startDate, endDate);
    }
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDates({
      ...customDates,
      [name]: value
    });
  };

  const applyCustomDateFilter = () => {
    fetchStatistics(customDates.startDate, customDates.endDate);
  };

  useEffect(() => {
    // Cargar estadísticas del día actual al inicio
    const today = format(new Date(), "yyyy-MM-dd");
    fetchStatistics(today, today);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Dashboard de Estadísticas</h1>
        
        {/* Filtros de fecha */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtrar por período</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleDateFilterChange("day")}
              className={`px-4 py-2 rounded ${
                dateFilter === "day" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Último día
            </button>
            <button
              onClick={() => handleDateFilterChange("week")}
              className={`px-4 py-2 rounded ${
                dateFilter === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Última semana
            </button>
            <button
              onClick={() => handleDateFilterChange("month")}
              className={`px-4 py-2 rounded ${
                dateFilter === "month" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Último mes
            </button>
            <button
              onClick={() => handleDateFilterChange("semester")}
              className={`px-4 py-2 rounded ${
                dateFilter === "semester" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Último semestre
            </button>
            <button
              onClick={() => handleDateFilterChange("year")}
              className={`px-4 py-2 rounded ${
                dateFilter === "year" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Último año
            </button>
            <button
              onClick={() => setDateFilter("custom")}
              className={`px-4 py-2 rounded ${
                dateFilter === "custom" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Personalizado
            </button>
          </div>
          
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="mb-1">Fecha inicio:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={customDates.startDate}
                  onChange={handleCustomDateChange}
                  className="border rounded p-2"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="mb-1">Fecha fin:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={customDates.endDate}
                  onChange={handleCustomDateChange}
                  className="border rounded p-2"
                />
              </div>
              <button
                onClick={applyCustomDateFilter}
                className="bg-blue-600 text-white px-4 py-2 rounded self-end"
              >
                Aplicar
              </button>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            Periodo actual: {statistics.startDate ? format(new Date(statistics.startDate), "dd/MM/yyyy") : ""} - 
            {statistics.endDate ? format(new Date(statistics.endDate), "dd/MM/yyyy") : ""}
          </div>
        </div>
        
        {/* Tarjetas de estadísticas */}
        {loading ? (
          <div className="text-center py-8">Cargando estadísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nuevos Clientes</h3>
              <p className="text-4xl font-bold text-blue-600">{statistics.newClientsCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nuevas Membresías</h3>
              <p className="text-4xl font-bold text-green-600">{statistics.newMembershipsCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Membresías Activas</h3>
              <p className="text-4xl font-bold text-purple-600">{statistics.activeMembershipsCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Ingresos Totales</h3>
              <p className="text-4xl font-bold text-orange-600">{statistics.totalIncome.toFixed(2)} Bs.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;