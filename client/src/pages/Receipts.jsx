import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Eye, Download, Trash2, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '', mobile: '', email: '', amount: '', purpose: '', paymentMode: 'Cash', utrNo: '', bankName: '', branch: '', remarks: ''
  });
  const [viewReceipt, setViewReceipt] = useState(null);

  const fetchReceipts = async () => {
    try {
      const { data } = await api.get('/receipts');
      setReceipts(data);
    } catch (error) {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/receipts', { ...formData, gender: 'Other' }); // Simplified for UI
      toast.success('Receipt created successfully');
      setShowModal(false);
      setFormData({ clientName: '', mobile: '', email: '', amount: '', purpose: '', paymentMode: 'Cash', utrNo: '', bankName: '', branch: '', remarks: '' });
      fetchReceipts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async (id, receiptNo) => {
    try {
      const response = await api.get(`/receipts/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${receiptNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to move this receipt to Trash? This action can be undone.')) return;
    try {
      await api.delete(`/receipts/${id}`);
      toast.success('Receipt moved to Trash');
      fetchReceipts();
    } catch (error) {
      toast.error('Failed to delete receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Receipts</h2>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow hover:bg-primary-light">
          <Plus size={20} className="mr-2" /> New Receipt
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr> : 
              receipts.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{r.receiptNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(r.createdAt || r.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">₹{r.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {r.paymentMode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => navigate(`/receipts/${r._id}/view`)} className="text-gray-500 hover:text-primary" title="View A4 Format">
                    <Eye size={18} className="inline" />
                  </button>
                  <button onClick={() => handleDownloadPDF(r._id, r.receiptNo)} className="text-gray-500 hover:text-primary" title="Download PDF">
                    <Download size={18} className="inline" />
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600" title="Move to Trash">
                      <Trash2 size={18} className="inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 border w-full max-w-2xl shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Receipt</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                  <input type="text" required value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                  <input type="text" required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Send receipt via email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                  <input type="text" required value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                  <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
                  </select>
                </div>
                {formData.paymentMode !== 'Cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UTR / Cheque No</label>
                    <input type="text" value={formData.utrNo} onChange={(e) => setFormData({...formData, utrNo: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
                <button type="submit" disabled={isSubmitting} className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-primary-light'}`}>
                  {isSubmitting ? 'Generating...' : 'Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 border w-full max-w-2xl shadow-lg rounded-lg relative">
            <button onClick={() => setViewReceipt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"><X size={24} /></button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">AYUSH Technologies</h2>
              <p className="text-sm text-gray-500">Receipt Details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="font-semibold text-gray-600">Receipt No:</span> {viewReceipt.receiptNo}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Created:</span> {new Date(viewReceipt.createdAt || viewReceipt.date).toLocaleString('en-IN')}</div>
              
              <div><span className="font-semibold text-gray-600">Client Name:</span> {viewReceipt.clientName}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Mobile:</span> {viewReceipt.mobile}</div>
              
              <div className="col-span-2 bg-green-50 p-4 rounded-md mt-2 mb-2 flex justify-between items-center border border-green-100">
                <span className="font-semibold text-gray-600 text-lg">Amount Received:</span>
                <span className="text-2xl font-bold text-green-600">₹ {viewReceipt.amount}</span>
              </div>

              <div><span className="font-semibold text-gray-600">Towards:</span> {viewReceipt.purpose}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Payment Mode:</span> {viewReceipt.paymentMode}</div>
              
              {viewReceipt.paymentMode !== 'Cash' && (
                <div className="col-span-2"><span className="font-semibold text-gray-600">Transaction No:</span> {viewReceipt.utrNo}</div>
              )}
              
              <div className="col-span-2"><span className="font-semibold text-gray-600">Remarks:</span> {viewReceipt.remarks || 'None'}</div>
              <div className="col-span-2"><span className="font-semibold text-gray-600">Received By:</span> {viewReceipt.receivedBy?.name || 'Staff'}</div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
              <button onClick={() => setViewReceipt(null)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
              <button onClick={() => handleDownloadPDF(viewReceipt._id, viewReceipt.receiptNo)} className="bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-light flex items-center">
                <Download size={18} className="mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
