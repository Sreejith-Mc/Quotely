import { useTheme } from '../../context/ThemeContext.jsx';

export default function SettingsTab() {
  const { dark, toggleDark } = useTheme();

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: '700 14px Manrope' }}>Dark Mode</div>
          <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 2 }}>Applies to your account on this device.</div>
        </div>
        <button
          onClick={toggleDark}
          style={{
            width: 46, height: 26, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
            background: dark ? 'var(--green)' : 'var(--border)', transition: 'background 0.15s',
          }}
        >
          <span style={{ position: 'absolute', top: 3, left: dark ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
        </button>
      </div>
    </div>
  );
}
