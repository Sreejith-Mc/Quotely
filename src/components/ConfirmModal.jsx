// In-app confirmation dialog styled to match the rest of the UI (replaces window.confirm).
export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,14,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: 16, animation: 'fadeIn .12s', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: 'var(--panel)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '800 17px Manrope', color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
        <p style={{ font: '500 13px Manrope', color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, border: 'none', background: danger ? 'var(--maroon)' : 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
