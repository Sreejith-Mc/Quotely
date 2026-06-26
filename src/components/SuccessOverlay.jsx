export default function SuccessOverlay({ open, number, grandTotal, onClose, onNewQuote }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(12,16,14,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .14s', backdropFilter: 'blur(3px)', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: 'var(--panel)', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pop .4s' }}>
          <span style={{ color: 'var(--green)', fontSize: 30 }}>✓</span>
        </div>
        <div style={{ font: '800 19px Manrope', color: 'var(--ink)' }}>Quotation Generated</div>
        <p style={{ font: '500 13px Manrope', color: 'var(--ink-2)', margin: '6px 0 2px' }}>{number} has been created and saved.</p>
        <p style={{ font: "600 13px 'JetBrains Mono'", color: 'var(--green)', margin: '0 0 20px' }}>{grandTotal}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink)', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>Close</button>
          <button onClick={onNewQuote} style={{ flex: 1, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>New Quotation</button>
        </div>
      </div>
    </div>
  );
}
