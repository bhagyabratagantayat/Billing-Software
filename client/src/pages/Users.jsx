import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Power, KeyRound, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', mobile: '', department: '', role: 'staff' });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User created successfully');
      setCreatedCredentials({ email: newUser.email, password: res.data.tempPassword });
      setNewUser({ name: '', email: '', mobile: '', department: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/users/${id}/status`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetPassword = async (id) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/users/${id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatedCredentials({ email: 'Password Reset', password: res.data.tempPassword });
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button onClick={() => { setShowModal(true); setCreatedCredentials(null); }} className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow hover:bg-primary-light">
          <Plus size={20} className="mr-2" /> New Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email / Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr> : 
              users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.department || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{u.email}</div>
                  <div className="text-xs text-gray-500">{u.mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.role === 'ceo' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {u.role !== 'ceo' && (currentUser.role === 'ceo' || (currentUser.role === 'admin' && u.role === 'staff')) && (
                    <>
                      <button onClick={() => resetPassword(u._id)} className="text-gray-500 hover:text-primary" title="Reset Password">
                        <KeyRound size={18} className="inline" />
                      </button>
                      <button onClick={() => toggleStatus(u._id, u.isActive)} className={`${u.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        <Power size={18} className="inline" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 border w-full max-w-lg shadow-lg rounded-lg">
            {!createdCredentials ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Create User Account</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input type="text" required value={newUser.mobile} onChange={(e) => setNewUser({...newUser, mobile: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                      <option value="staff">Staff</option>
                      {currentUser?.role === 'ceo' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-light">Create Account</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <KeyRound className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Credentials Generated</h3>
                <p className="text-sm text-gray-500 mb-4">Please copy these credentials and share them securely. A welcome email has also been sent if configured.</p>
                <div className="bg-gray-50 p-4 rounded text-left space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="font-mono text-sm">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-gray-500">Temp Password:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm bg-yellow-100 px-2 py-1 rounded">{createdCredentials.password}</span>
                      <button onClick={() => copyToClipboard(createdCredentials.password)} className="text-gray-400 hover:text-gray-600"><Copy size={16} /></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-light sm:text-sm">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

