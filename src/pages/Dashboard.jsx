import { useState, useEffect } from 'react';
    import { supabase } from '../supabaseClient';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
    import { Button } from "@material-tailwind/react";

    const Dashboard = () => {
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [vehicleStatuses, setVehicleStatuses] = useState({});
      const [revenueExpenses, setRevenueExpenses] = useState({});
      const [revenueByStatus, setRevenueByStatus] = useState({});
      const [activitiesByType, setActivitiesByType] = useState({});
      const [revenueData, setRevenueData] = useState([]);
      const [timeRange, setTimeRange] = useState('monthly'); // Default time range

      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

      useEffect(() => {
        const fetchDashboardData = async () => {
          setLoading(true);
          setError(null);

          try {
            // Fetch Vehicle Statuses
            const { data: vehicleStatusData, error: vehicleStatusError } = await supabase
              .from('vehicles')
              .select('status')

            if (vehicleStatusError) {
              setError(vehicleStatusError.message)
              return
            }

            const statusCounts = vehicleStatusData.reduce((acc, vehicle) => {
              acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
              return acc
            }, {})
            setVehicleStatuses(statusCounts)

            // Fetch Activities and Calculate Revenue and Expenses
            const { data: activityData, error: activityError } = await supabase
              .from('activities')
              .select('date, activity_type, amount, status');

            if (activityError) {
              setError(activityError.message);
              return;
            }

            let totalRevenue = 0;
            let totalExpenses = 0;

            activityData.forEach(activity => {
              if (activity.activity_type === "Pago de tarifa") {
                totalRevenue += activity.amount || 0;
              } else {
                totalExpenses += activity.amount || 0;
              }
            });

            setRevenueExpenses({ revenue: totalRevenue, expenses: totalExpenses });

            // Fetch Revenue by Status
            const revenueStatusCounts = activityData.reduce((acc, activity) => {
              if (activity.activity_type === "Pago de tarifa") {
                acc[activity.status] = (acc[activity.status] || 0) + (activity.amount || 0);
              }
              return acc;
            }, {});
            setRevenueByStatus(revenueStatusCounts);

            // Fetch Activities by Type
            const activityTypeCounts = activityData.reduce((acc, activity) => {
              acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
              return acc
            }, {})
            setActivitiesByType(activityTypeCounts)

            // Prepare data for the Revenue Chart
            let startDate;
            const today = new Date();
            switch (timeRange) {
              case 'weekely':
                startDate = new Date(today.setDate(today.getDate() - 7));
                break;
              case 'monthly':
                startDate = new Date(today.setMonth(today.getMonth() - 1));
                break;
              case 'quarterly':
                startDate = new Date(today.setMonth(today.getMonth() - 3));
                break;
              default:
                startDate = null;
            }

            let query = supabase
              .from('activities')
              .select('date, amount, activity_type')
              .order('date', { ascending: true });

            if (startDate) {
              query = query.gte('date', startDate.toISOString().split('T')[0]);
            }

            const { data: timeData, error: timeError } = await query;

            if (timeError) {
              setError(timeError.message);
              return;
            }

            const revenueChartData = timeData.map(item => ({
              date: item.date,
              amount: item.activity_type === "Pago de tarifa" ? (item.amount || 0) : -(item.amount || 0), // Expenses as negative values
            }));
            setRevenueData(revenueChartData);

          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        fetchDashboardData()
      }, [timeRange])

      const handleTimeRangeChange = (newTimeRange) => {
        setTimeRange(newTimeRange);
      };

      if (loading) {
        return <div className="flex items-center justify-center h-full">Cargando...</div>
      }

      if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>
      }

      const balance = revenueExpenses.revenue - revenueExpenses.expenses

      const pieChartData = Object.entries(vehicleStatuses).map(([name, value]) => ({
        name,
        value,
      }));

      return (
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Vehicle Statuses */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Vehiculos por estado</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue vs Expenses */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Balance</h2>
              <p>Ingresos: ${revenueExpenses.revenue}</p>
              <p>Gastos: ${revenueExpenses.expenses}</p>
              <p>Balance: ${balance}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
            {/* Revenue by Status */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Ingresos por estado</h2>
              <p>Completado: ${revenueByStatus.complete || 0}</p>
              <p>Incompleto: ${revenueByStatus.incomplete || 0}</p>
              <p>Vencido: ${revenueByStatus.pastdue || 0}</p>
              <p>Cancelado: ${revenueByStatus.canceled || 0}</p>
            </div>

            {/* Activities by Type */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Actividades por categoria</h2>
              {Object.entries(activitiesByType).map(([type, count]) => (
                <p key={type}>{type}: {count}</p>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Ingresos a travez del tiempo</h2>
            <div className="flex space-x-2 mb-4">
              <Button color="blue" onClick={() => handleTimeRangeChange('weekly')}>Semanal</Button>
              <Button color="blue" onClick={() => handleTimeRangeChange('monthly')}>Mensual</Button>
              <Button color="blue" onClick={() => handleTimeRangeChange('quarterly')}>Trimestral</Button>
              <Button color="blue" onClick={() => handleTimeRangeChange('all')}>Historico</Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }

    export default Dashboard
