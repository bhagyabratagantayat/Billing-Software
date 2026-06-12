import { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, FileText, FileSpreadsheet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Received</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary?.totalReceived)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary?.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Net Balance</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary?.netBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{summary?.totalTransactions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Transactions Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400">
            Chart integration goes here
          </div>
        </div>
      </div>
    </div>
  );
}
