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

        // Fetch Revenue and Expenses
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue')
          .select('date, amount, status')

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')

        if (revenueError || expensesError) {
          setError(revenueError?.message || expensesError?.message)
          return
        }

        const totalRevenue = revenueData?.reduce((sum, item) => sum + item.amount, 0) || 0
        const totalExpenses = expensesData?.reduce((sum, item) => sum + item.amount, 0) || 0

        setRevenueExpenses({ revenue: totalRevenue, expenses: totalExpenses })

        // Fetch Revenue by Status
        const revenueStatusCounts = revenueData.reduce((acc, revenue) => {
          acc[revenue.status] = (acc[revenue.status] || 0) + revenue.amount
          return acc
        }, {})
        setRevenueByStatus(revenueStatusCounts)

        // Fetch Activities by Type
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('activity_type')

        if (activityError) {
          setError(activityError.message)
          return
        }

        const activityTypeCounts = activityData.reduce((acc, activity) => {
          acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
          return acc
        }, {})
        setActivitiesByType(activityTypeCounts)

        // Prepare data for the Revenue Chart
        let startDate;
        const today = new Date();
        switch (timeRange) {
          case 'weekly':
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
          .from('revenue')
          .select('date, amount, status')
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
          amount: item.amount,
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
    return <div className="flex items-center justify-center h-full">Loading...</div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.vehicles || '0'}</p>
            </div>
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <span className="material-icons text-2xl">directions_car</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Drivers</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.drivers || '0'}</p>
            </div>
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <span className="material-icons text-2xl">people</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-green-600">+5.2%</span>
            <span className="text-sm text-gray-500 ml-1">from previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">${stats?.revenue || '0'}</p>
            </div>
            <div className="rounded-full p-3 bg-purple-100 text-purple-600">
              <span className="material-icons text-2xl">payments</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-green-600">+12.3%</span>
            <span className="text-sm text-gray-500 ml-1">from previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Maintenance</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.maintenance || '0'}</p>
            </div>
            <div className="rounded-full p-3 bg-amber-100 text-amber-600">
              <span className="material-icons text-2xl">build</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-red-600">-3.1%</span>
            <span className="text-sm text-gray-500 ml-1">from previous period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">Recent Vehicles</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-4">
                <img
                  src="https://images.unsplash.com/photo-1552519507-da314aeb6737?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Fyc3xlbnwwfHwwfHw%3D&w=1000&q=80"
                  alt="Car"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Toyota Camry
                </p>
                <p className="text-sm text-gray-500 truncate">
                  License Plate: ABC-123
                </p>
              </div>
              <div className="ml-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-4">
                <img
                  src="https://images.unsplash.com/photo-1549399543-9c0c9c0b5b6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2Fyc3xlbnwwfHwwfHw%3D&w=1000&q=80"
                  alt="Car"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Honda Civic
                </p>
                <p className="text-sm text-gray-500 truncate">
                  License Plate: XYZ-789
                </p>
              </div>
              <div className="ml-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                    <span className="material-icons text-sm">add</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    New vehicle added: Toyota Camry
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Today at 10:30 AM • John Doe
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="material-icons text-sm">edit</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    Vehicle status updated: Honda Civic - Inactive
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Yesterday • Jane Smith
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Revenue Over Time</h2>
        <div className="flex space-x-2 mb-4">
          <Button color="blue" onClick={() => handleTimeRangeChange('weekly')}>Weekly</Button>
          <Button color="blue" onClick={() => handleTimeRangeChange('monthly')}>Monthly</Button>
          <Button color="blue" onClick={() => handleTimeRangeChange('quarterly')}>Quarterly</Button>
          <Button color="blue" onClick={() => handleTimeRangeChange('all')}>All</Button>
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
