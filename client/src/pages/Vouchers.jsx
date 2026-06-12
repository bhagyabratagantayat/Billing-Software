import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Eye, Download, Trash2, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    payeeName: '', mobile: '', amount: '', purpose: '', paymentMode: 'Cash', utrNo: '', bankName: '', remarks: ''
  });
  const [viewVoucher, setViewVoucher] = useState(null);

  const fetchVouchers = async () => {
    try {
      const { data } = await api.get('/vouchers');
      // API returns { vouchers: [], page: 1... } with pagination
      setVouchers(data.vouchers || data);
    } catch (error) {
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/vouchers', formData);
      toast.success('Voucher created successfully');
      setShowModal(false);
      setFormData({ payeeName: '', mobile: '', amount: '', purpose: '', paymentMode: 'Cash', utrNo: '', bankName: '', remarks: '' });
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async (id, voucherNo) => {
    try {
      const response = await api.get(`/vouchers/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${voucherNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to move this voucher to Trash? This action can be undone.')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      toast.success('Voucher moved to Trash');
      fetchVouchers();
    } catch (error) {
      toast.error('Failed to delete voucher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Payment Vouchers</h2>
        <button onClick={() => setShowModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center shadow hover:bg-red-700">
          <Plus size={20} className="mr-2" /> New Voucher
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr> : 
              (Array.isArray(vouchers) ? vouchers : []).map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{v.voucherNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(v.createdAt || v.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.payeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">₹{v.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {v.paymentMode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => navigate(`/vouchers/${v._id}/view`)} className="text-gray-500 hover:text-primary" title="View A4 Format">
                    <Eye size={18} className="inline" />
                  </button>
                  <button onClick={() => handleDownloadPDF(v._id, v.voucherNo)} className="text-gray-500 hover:text-primary" title="Download PDF">
                    <Download size={18} className="inline" />
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-600" title="Move to Trash">
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
              <h3 className="text-xl font-bold text-gray-900">Create Payment Voucher</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payee Name *</label>
                  <input type="text" required value={formData.payeeName} onChange={(e) => setFormData({...formData, payeeName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Towards / Purpose *</label>
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
                    <label className="block text-sm font-medium text-gray-700">Transaction / Cheque No</label>
                    <input type="text" value={formData.utrNo} onChange={(e) => setFormData({...formData, utrNo: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
                <button type="submit" disabled={isSubmitting} className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isSubmitting ? 'Generating...' : 'Generate Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewVoucher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 border w-full max-w-2xl shadow-lg rounded-lg relative">
            <button onClick={() => setViewVoucher(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"><X size={24} /></button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">AYUSH Technologies</h2>
              <p className="text-sm text-gray-500">Voucher Details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="font-semibold text-gray-600">Voucher No:</span> {viewVoucher.voucherNo}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Created:</span> {new Date(viewVoucher.createdAt || viewVoucher.date).toLocaleString('en-IN')}</div>
              
              <div><span className="font-semibold text-gray-600">Payee Name:</span> {viewVoucher.payeeName}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Mobile:</span> {viewVoucher.mobile}</div>
              
              <div className="col-span-2 bg-red-50 p-4 rounded-md mt-2 mb-2 flex justify-between items-center border border-red-100">
                <span className="font-semibold text-gray-600 text-lg">Amount Paid:</span>
                <span className="text-2xl font-bold text-red-600">₹ {viewVoucher.amount}</span>
              </div>

              <div><span className="font-semibold text-gray-600">Towards:</span> {viewVoucher.purpose}</div>
              <div className="text-right"><span className="font-semibold text-gray-600">Payment Mode:</span> {viewVoucher.paymentMode}</div>
              
              {viewVoucher.paymentMode !== 'Cash' && (
                <div className="col-span-2"><span className="font-semibold text-gray-600">Transaction No:</span> {viewVoucher.utrNo}</div>
              )}
              
              <div className="col-span-2"><span className="font-semibold text-gray-600">Remarks:</span> {viewVoucher.remarks || 'None'}</div>
              <div className="col-span-2"><span className="font-semibold text-gray-600">Prepared By:</span> {viewVoucher.preparedBy?.name || 'Staff'}</div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
              <button onClick={() => setViewVoucher(null)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
              <button onClick={() => handleDownloadPDF(viewVoucher._id, viewVoucher.voucherNo)} className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 flex items-center">
                <Download size={18} className="mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
