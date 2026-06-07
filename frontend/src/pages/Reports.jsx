import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock } from 'lucide-react';

const Reports = () => {
  const [lowStock, setLowStock] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [lowStockRes, expiringRes] = await Promise.all([
          axios.get('http://localhost:5005/api/reports/low-stock'),
          axios.get('http://localhost:5005/api/reports/expiring-soon')
        ]);
        setLowStock(lowStockRes.data);
        setExpiringSoon(expiringRes.data);
      } catch (error) {
        console.error('Error fetching reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Report */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-900">Low Stock Alert</h2>
          </div>
          <div className="p-4">
            {lowStock.length === 0 ? (
              <p className="text-slate-500">No items are currently low on stock.</p>
            ) : (
              <ul className="space-y-3">
                {lowStock.map(med => (
                  <li key={med.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-500">Threshold: {med.low_stock_threshold}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                      {med.total_quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expiring Soon Report */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Expiring in next 30 days</h2>
          </div>
          <div className="p-4">
            {expiringSoon.length === 0 ? (
              <p className="text-slate-500">No batches are expiring soon.</p>
            ) : (
              <ul className="space-y-3">
                {expiringSoon.map(batch => (
                  <li key={batch.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{batch.medicine?.name} (Batch: {batch.batch_number})</p>
                      <p className="text-xs text-slate-500">Qty: {batch.quantity}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                      Expires: {new Date(batch.expiry_date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
