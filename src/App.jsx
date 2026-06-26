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
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const showHeader = pathname !== '/login';

  return (
    <div style={{ minHeight: '100vh' }}>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<CreateQuotation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="branding" element={<Branding />} />
          <Route path="company" element={<CompanyInfo />} />
          <Route path="tax" element={<TaxSettings />} />
          <Route path="numbering" element={<Numbering />} />
          <Route path="terms" element={<Terms />} />
          <Route path="employees" element={<Employees />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<SettingsTab />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </div>
  );
}
