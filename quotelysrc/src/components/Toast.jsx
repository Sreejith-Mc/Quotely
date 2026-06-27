import { useToastMessage } from '../context/ToastContext.jsx';

export default function Toast() {
  const msg = useToastMessage();
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', zIndex: 80, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 11, background: 'var(--ink)', color: '#fff', padding: '13px 18px', borderRadius: 13, boxShadow: '0 12px 32px rgba(0,0,0,0.25)', animation: 'toastIn .22s ease' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
      <span style={{ font: '600 13px Manrope' }}>{msg}</span>
    </div>
  );
}
