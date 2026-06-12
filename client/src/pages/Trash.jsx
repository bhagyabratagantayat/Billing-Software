import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export default function Trash() {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashItems = async () => {
    try {
      const { data } = await api.get('/trash');
      setTrashItems(data);
    } catch (error) {
      toast.error('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrashItems(); }, []);

  const handleRestore = async (type, id) => {
    try {
      await api.put(`/trash/${type}/${id}/restore`);
      toast.success(`${type} restored successfully`);
      fetchTrashItems();
    } catch (error) {
      toast.error('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (type, id) => {
    if (!window.confirm('This will permanently delete this record. This cannot be undone.')) return;
    try {
      await api.delete(`/trash/${type}/${id}`);
      toast.success(`${type} permanently deleted`);
      fetchTrashItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL items in the trash? This cannot be undone.')) return;
    try {
      await api.delete('/trash/empty');
      toast.success('Trash emptied');
      fetchTrashItems();
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Trash Bin</h2>
        {trashItems.length > 0 && (
          <button onClick={handleEmptyTrash} className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center shadow hover:bg-red-700">
            <Trash2 size={20} className="mr-2" /> Empty Trash
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : trashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Trash2 size={48} className="mb-4" />
            <p className="text-lg">Trash is empty</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client/Payee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trashItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'Receipt' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {item.type === 'Receipt' ? item.receiptNo : item.voucherNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.type === 'Receipt' ? item.clientName : item.payeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                    ₹{item.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.deletedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleRestore(item.type, item._id)} className="text-green-600 hover:text-green-900 mr-4" title="Restore">
                      <RotateCcw size={18} className="inline" />
                    </button>
                    <button onClick={() => handlePermanentDelete(item.type, item._id)} className="text-red-600 hover:text-red-900" title="Permanently Delete">
                      <Trash2 size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
