import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    // Validate complexity
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(newPassword)) {
      return toast.error('Password must be at least 8 chars long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special char');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Password changed successfully!');
      
      // Update local context to remove mustChangePassword restriction
      setUser(prev => ({ ...prev, mustChangePassword: false }));
      
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Make sure current password is correct and new password is not recently used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Update</h2>
        <p className="text-gray-600 mb-6 text-sm">
          {user?.mustChangePassword ? 'You are required to change your password to continue.' : 'Update your password for enhanced security.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input 
              type="password" 
              required 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              required 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
            />
            <p className="text-xs text-gray-500 mt-2">
              Must be 8+ characters, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character. Cannot be one of your last 3 passwords.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md shadow text-white font-medium ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-light'}`}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
