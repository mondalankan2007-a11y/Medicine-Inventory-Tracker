import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, AlertTriangle, Clock, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/reports/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const chartData = [
    { name: 'Total Medicines', value: data?.totalMedicines || 0 },
    { name: 'Low Stock Items', value: data?.lowStockCount || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Medicines" 
          value={data?.totalMedicines || 0} 
          icon={Pill} 
          colorClass="bg-blue-500" 
        />
        <DashboardCard 
          title="Low Stock Items" 
          value={data?.lowStockCount || 0} 
          icon={AlertTriangle} 
          colorClass="bg-orange-500" 
        />
        <DashboardCard 
          title="Total Stock Value" 
          value={`₹${(data?.totalStockValue || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="bg-emerald-500" 
        />
        <DashboardCard 
          title="Today's Sales" 
          value={`₹${(data?.todaysSales || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          colorClass="bg-indigo-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Inventory Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
