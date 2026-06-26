import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const adminMode = params.get('as') === 'admin';
  const { signIn } = useAuth();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function doLogin() {
    setLoading(true);
    setError('');
    const { data, error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const { user } = data;
    // role is resolved from the profiles row by AuthContext; route by intent.
    toast(adminMode ? 'Welcome back, Admin' : 'Signed in');
    navigate(adminMode ? '/admin/overview' : '/', { replace: true });
    void user;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17 }}>Q</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Quotely</div>
          </div>
          <h1 style={{ font: '800 26px Manrope', letterSpacing: '-0.02em', margin: '0 0 4px' }}>{adminMode ? 'Admin sign in' : 'Employee sign in'}</h1>
          <p style={{ font: '500 13px Manrope', color: 'var(--ink-2)', margin: '0 0 24px' }}>{adminMode ? 'Manage company settings, employees and tax.' : 'Sign in to start creating quotations.'}</p>

          <label style={labelStyle}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@logtech.in" style={{ ...fieldStyle, marginBottom: 14 }} />
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...fieldStyle, marginBottom: 18 }} onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
          {error && <p style={{ color: 'var(--maroon)', font: '600 12px Manrope', margin: '0 0 14px' }}>{error}</p>}
          <button onClick={doLogin} disabled={loading} style={{ width: '100%', border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 14px Manrope', padding: 13, borderRadius: 11, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : adminMode ? 'Sign in as Admin' : 'Sign in'}
          </button>
          <button onClick={() => navigate(adminMode ? '/login' : '/login?as=admin')} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', font: '600 12px Manrope', padding: 14, marginTop: 6 }}>
            {adminMode ? 'Sign in as Employee instead' : 'Sign in as Admin instead'}
          </button>
        </div>
      </div>
      {!isMobile && (
      <div style={{ background: 'var(--green)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, color: '#eaf3ec' }}>
        <div style={{ font: '800 30px Manrope', lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff', maxWidth: 380 }}>Professional quotations in under two minutes.</div>
        <p style={{ font: '500 14px Manrope', color: 'rgba(255,255,255,0.78)', marginTop: 14, maxWidth: 360, lineHeight: 1.6 }}>Smart GST auto-calculation, pixel-perfect PDF output, and a live preview that matches your final document exactly.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {['Auto tax', 'Live preview', 'PDF export'].map((t) => (
            <span key={t} style={{ font: '600 12px Manrope', background: 'rgba(255,255,255,0.14)', padding: '7px 13px', borderRadius: 20 }}>{t}</span>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 6 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 11, font: '500 14px Manrope', outline: 'none' };
