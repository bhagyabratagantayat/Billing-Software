import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Receipts from './pages/Receipts';
import Vouchers from './pages/Vouchers';
import Trash from './pages/Trash';
import ReceiptView from './pages/ReceiptView';
import VoucherView from './pages/VoucherView';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import ChangePassword from './pages/ChangePassword';
import { LayoutDashboard, Receipt, FileText, Trash2, LogOut, Users as UsersIcon, History, KeyRound } from 'lucide-react';
import ayushLogo from './assets/Ayush tech logo.jpeg';

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-primary text-white p-6 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <img src={ayushLogo} alt="AYUSH Tech Logo" className="w-24 h-24 rounded-full bg-white p-1 mb-3 shadow-lg object-cover" />
          <h1 className="text-2xl font-bold text-center">AYUSH Tech</h1>
        </div>
        <nav className="space-y-4 flex-1">
          <Link to="/" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><LayoutDashboard size={20} /><span>Dashboard</span></Link>
          <Link to="/receipts" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><Receipt size={20} /><span>Receipts</span></Link>
          <Link to="/vouchers" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><FileText size={20} /><span>Vouchers</span></Link>
          {['admin', 'ceo'].includes(user?.role) && (
            <>
              <Link to="/users" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><UsersIcon size={20} /><span>User Management</span></Link>
              <Link to="/trash" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><Trash2 size={20} /><span>Trash</span></Link>
            </>
          )}
          {user?.role === 'ceo' && (
            <Link to="/audit-logs" className="flex items-center space-x-3 hover:bg-primary-light p-2 rounded transition-colors"><History size={20} /><span>Audit Logs</span></Link>
          )}
        </nav>
        <div className="mt-auto border-t border-primary-light pt-4">
          <p className="text-sm mb-4 truncate">{user?.email}</p>
          <button onClick={logout} className="flex items-center space-x-3 text-red-300 hover:text-red-400 w-full"><LogOut size={20} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Force password change check
  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }

  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" />;
  }

  if (user.role !== 'admin' && user.role !== 'ceo') {
    import('react-hot-toast').then(({ default: toast }) => toast.error('Access denied. Admin only.'));
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

const CeoRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" />;
  }

  if (user.role !== 'ceo') {
    import('react-hot-toast').then(({ default: toast }) => toast.error('Access denied. CEO only.'));
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<Layout><ChangePassword /></Layout>} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
      <Route path="/receipts/:id/view" element={<ProtectedRoute><ReceiptView /></ProtectedRoute>} />
      
      <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
      <Route path="/vouchers/:id/view" element={<ProtectedRoute><VoucherView /></ProtectedRoute>} />
      
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/trash" element={<AdminRoute><Trash /></AdminRoute>} />
      
      <Route path="/audit-logs" element={<CeoRoute><AuditLogs /></CeoRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
