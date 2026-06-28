import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import CreateQuotation from './pages/CreateQuotation.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Overview from './pages/admin/Overview.jsx';
import Branding from './pages/admin/Branding.jsx';
import CompanyInfo from './pages/admin/CompanyInfo.jsx';
import TaxSettings from './pages/admin/TaxSettings.jsx';
import Numbering from './pages/admin/Numbering.jsx';
import Terms from './pages/admin/Terms.jsx';
import Employees from './pages/admin/Employees.jsx';
import Products from './pages/admin/Products.jsx';
import Templates from './pages/admin/Templates.jsx';
import SettingsTab from './pages/admin/SettingsTab.jsx';
import { useAuth } from './context/AuthContext.jsx';

function RequireAuth({ children }) {
  const { loggedIn, loading } = useAuth();
  if (loading) return null;
  if (!loggedIn) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin, loading, loggedIn } = useAuth();
  if (loading) return null;
  if (!loggedIn) return <Navigate to="/login?as=admin" replace />;
  if (!isAdmin) return <Navigate to="/admin/overview" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const { loggedIn } = useAuth();
  // Header (and its nav) only exists once signed in — login is the sole entry point.
  const showHeader = loggedIn && pathname !== '/login';

  return (
    <div style={{ minHeight: '100vh' }}>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<RequireAuth><CreateQuotation /></RequireAuth>} />
        <Route path="/edit/:id" element={<RequireAuth><CreateQuotation /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        {/* Dashboard (overview) is open to any signed-in user; the rest is admin-only. */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="branding" element={<RequireAdmin><Branding /></RequireAdmin>} />
          <Route path="company" element={<RequireAdmin><CompanyInfo /></RequireAdmin>} />
          <Route path="tax" element={<RequireAdmin><TaxSettings /></RequireAdmin>} />
          <Route path="numbering" element={<RequireAdmin><Numbering /></RequireAdmin>} />
          <Route path="terms" element={<RequireAdmin><Terms /></RequireAdmin>} />
          <Route path="employees" element={<RequireAdmin><Employees /></RequireAdmin>} />
          <Route path="products" element={<RequireAdmin><Products /></RequireAdmin>} />
          <Route path="templates" element={<RequireAdmin><Templates /></RequireAdmin>} />
          <Route path="settings" element={<RequireAdmin><SettingsTab /></RequireAdmin>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </div>
  );
}
