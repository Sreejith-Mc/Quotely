import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const NAV = [
  ['overview', 'Dashboard', '▤', 'Overview of quotation activity'],
  ['branding', 'Branding', '◑', 'Logo and seal — applied to all new quotations'],
  ['company', 'Company Info', '🏢', 'Details printed on every quotation — employees can never edit these'],
  ['employees', 'Employees', '◍', 'Create, edit and manage your team'],
  ['tax', 'Tax Settings', '%', 'GST percentages applied to every new quotation'],
  ['numbering', 'Numbering', '#', 'Control prefix and sequence'],
  ['terms', 'Terms', '¶', 'Default terms printed on every quotation'],
  ['templates', 'Templates', '▦', 'Pick the look of your quotation — same data, different design'],
  ['settings', 'Settings', '⚙', 'Workspace preferences'],
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const active = NAV.find(([id]) => pathname.endsWith(id)) || NAV[0];

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 62px)' }}>
        <nav style={{ display: 'flex', gap: 6, overflowX: 'auto', borderBottom: '1px solid var(--border)', background: 'var(--panel)', padding: '10px 12px', WebkitOverflowScrolling: 'touch' }}>
          {NAV.map(([id, label, icon]) => (
            <NavLink key={id} to={id} style={({ isActive }) => ({ ...navStyle(isActive), padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0 })}>
              <span style={{ width: 16, textAlign: 'center' }}>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <main style={{ padding: '20px 16px' }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, font: '800 20px Manrope', letterSpacing: '-0.02em' }}>{active[1]}</h1>
            <p style={{ margin: '5px 0 0', font: '500 12px Manrope', color: 'var(--ink-2)' }}>{active[3]}</p>
          </div>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: 'calc(100vh - 62px)' }}>
      <aside style={{ borderRight: '1px solid var(--border)', background: 'var(--panel)', padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ font: '700 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px 8px' }}>Admin</div>
        {NAV.map(([id, label, icon]) => (
          <NavLink key={id} to={id} style={({ isActive }) => navStyle(isActive)}>
            <span style={{ width: 18, textAlign: 'center' }}>{icon}</span>{label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ font: '600 11px Manrope', color: 'var(--ink-2)' }}>Signed in as Admin</div>
          <div style={{ font: '500 11px Manrope', color: 'var(--ink-3)', marginTop: 2 }}>{profile?.email}</div>
        </div>
      </aside>
      <main style={{ padding: '30px 34px', overflow: 'auto', maxHeight: 'calc(100vh - 62px)' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ margin: 0, font: '800 24px Manrope', letterSpacing: '-0.02em' }}>{active[1]}</h1>
          <p style={{ margin: '5px 0 0', font: '500 13px Manrope', color: 'var(--ink-2)' }}>{active[3]}</p>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function navStyle(isActive) {
  return {
    display: 'flex', alignItems: 'center', gap: 11, border: 'none', cursor: 'pointer',
    font: '600 13px Manrope', padding: '10px 12px', borderRadius: 10, textAlign: 'left',
    background: isActive ? 'var(--green-soft)' : 'transparent', color: isActive ? 'var(--green)' : 'var(--ink-2)',
    textDecoration: 'none',
  };
}
