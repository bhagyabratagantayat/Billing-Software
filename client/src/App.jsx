import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useContext, useState, useEffect } from 'react';
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
import { LayoutDashboard, Receipt, FileText, Trash2, LogOut, Users as UsersIcon, History, KeyRound, Menu, X } from 'lucide-react';
import ayushLogo from './assets/Ayush tech logo.jpeg';

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <img src={ayushLogo} alt="Logo" className="w-10 h-10 rounded-full bg-white p-0.5 object-cover" />
          <h1 className="text-xl font-bold">AYUSH Tech</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-primary text-white p-6 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col items-center mb-6 hidden md:flex">
          <img src={ayushLogo} alt="AYUSH Tech Logo" className="w-24 h-24 rounded-full bg-white p-1 mb-3 shadow-lg object-cover" />
          <h1 className="text-2xl font-bold text-center">AYUSH Tech</h1>
        </div>
        
        {/* Panel Identity */}
        <div className="bg-white/10 rounded-lg p-4 mb-8 text-center border border-white/20">
          <h2 className="text-sm font-bold text-blue-200 tracking-wider uppercase mb-1">
            {user?.role === 'ceo' ? 'CEO Panel' : user?.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
          </h2>
          <p className="text-lg font-semibold truncate" title={user?.name || user?.email}>{user?.name || 'User'}</p>
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
          <p className="text-xs text-blue-200 mb-4 truncate">{user?.email}</p>
          <button onClick={logout} className="flex items-center space-x-3 text-red-300 hover:text-red-400 w-full"><LogOut size={20} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-100 pt-20 md:pt-8 p-4 md:p-8">
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
