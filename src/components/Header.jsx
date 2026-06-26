import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { initialsOf } from '../lib/calc.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const SCREEN_LINKS = [
  { label: 'Create Quotation', icon: '✎', to: '/' },
  { label: 'Dashboard', icon: '▤', to: '/admin/overview' },
  { label: 'Company Branding', icon: '◑', to: '/admin/branding' },
  { label: 'Employee Management', icon: '◍', to: '/admin/employees' },
  { label: 'Tax Settings', icon: '%', to: '/admin/tax' },
  { label: 'Quotation Numbering', icon: '#', to: '/admin/numbering' },
  { label: 'Terms & Conditions', icon: '¶', to: '/admin/terms' },
  { label: 'Employee Login', icon: '◐', to: '/login' },
  { label: 'Admin Login', icon: '⚿', to: '/login?as=admin' },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { loggedIn, profile, signOut } = useAuth();
  const { dark, toggleDark } = useTheme();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isCreate = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--panel)', borderBottom: '1px solid var(--border)', padding: isMobile ? '0 14px' : '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'saturate(1.4) blur(8px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>Q</div>
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Quotely</div>
        {!isMobile && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', marginLeft: 2 }}>v2.0</div>}
      </div>

      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/')} style={pillStyle(isCreate)}>Create Quotation</button>
          <button onClick={() => navigate('/admin/overview')} style={pillStyle(isAdmin)}>Dashboard</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
        <button onClick={() => { setMenuOpen((v) => !v); setProfileOpen(false); }} title="All screens" style={iconBtnStyle(true)}>{isMobile ? '▦' : '▦ Screens'}</button>
        <button onClick={toggleDark} title="Toggle theme" style={{ ...iconBtnStyle(false), width: 36, height: 36, fontSize: 15 }}>{dark ? '☀' : '☾'}</button>

        {loggedIn && profile ? (
          <button onClick={() => { setProfileOpen((v) => !v); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid var(--border)', background: 'var(--panel)', cursor: 'pointer', padding: isMobile ? 5 : '5px 12px 5px 6px', borderRadius: 11, marginLeft: 2 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 12px Manrope' }}>{initialsOf(profile.name)}</span>
            {!isMobile && (
              <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <span style={{ display: 'block', font: '700 12px Manrope', color: 'var(--ink)' }}>{profile.name}</span>
                <span style={{ display: 'block', font: '500 10px Manrope', color: 'var(--ink-3)' }}>{profile.role}</span>
              </span>
            )}
          </button>
        ) : (
          <button onClick={() => navigate('/login')} style={{ border: 'none', cursor: 'pointer', font: '700 13px Manrope', padding: '9px 16px', borderRadius: 10, background: 'var(--green)', color: '#fff', marginLeft: 2 }}>Login</button>
        )}

        {menuOpen && (
          <div style={dropdownStyle}>
            <div style={{ font: '700 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px' }}>Deliverable screens</div>
            {SCREEN_LINKS.map((s) => (
              <button key={s.label} onClick={() => { navigate(s.to); setMenuOpen(false); }} style={dropdownItemStyle}>
                <span style={{ width: 18, textAlign: 'center', color: 'var(--ink-3)' }}>{s.icon}</span>{s.label}
              </button>
            ))}
            <button onClick={() => { toggleDark(); setMenuOpen(false); }} style={dropdownItemStyle}>
              <span style={{ width: 18, textAlign: 'center', color: 'var(--ink-3)' }}>{dark ? '☀' : '☾'}</span>{dark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
        {profileOpen && (
          <div style={dropdownStyle}>
            <button onClick={() => { navigate('/profile'); setProfileOpen(false); }} style={dropdownItemStyle}>⚙ Edit Profile</button>
            <button onClick={() => { signOut(); setProfileOpen(false); navigate('/'); }} style={{ ...dropdownItemStyle, color: 'var(--maroon)' }}>⏻ Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function pillStyle(active) {
  return { border: 'none', cursor: 'pointer', font: '600 13px Manrope', padding: '8px 14px', borderRadius: 10, background: active ? 'var(--green-soft)' : 'transparent', color: active ? 'var(--green)' : 'var(--ink-2)' };
}
function iconBtnStyle() {
  return { display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink-2)', cursor: 'pointer', font: '600 12px Manrope', padding: '8px 11px', borderRadius: 10 };
}
const dropdownStyle = { position: 'absolute', top: 48, right: 0, width: 230, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 6, zIndex: 50, animation: 'fadeIn .12s' };
const dropdownItemStyle = { display: 'flex', width: '100%', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', font: '600 12.5px Manrope', color: 'var(--ink)', padding: '9px 10px', borderRadius: 9, textAlign: 'left' };
