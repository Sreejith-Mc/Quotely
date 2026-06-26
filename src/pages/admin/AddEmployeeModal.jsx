import { useState } from 'react';
import { genTempPassword } from '../../lib/calc.js';

export default function AddEmployeeModal({ onClose, onInvite }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(genTempPassword());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    setSending(true);
    setError('');
    const err = await onInvite({ name, email, password });
    setSending(false);
    if (err) setError(err);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--panel)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ font: '800 18px Manrope', marginBottom: 4 }}>Add Employee</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 18px' }}>They'll be able to sign in with this temporary password.</p>

        <label style={labelStyle}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...fieldStyle, marginBottom: 12 }} />
        <label style={labelStyle}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...fieldStyle, marginBottom: 12 }} />
        <label style={labelStyle}>Temporary Password</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={password} readOnly style={{ ...fieldStyle, fontFamily: "'JetBrains Mono'" }} />
          <button onClick={() => setPassword(genTempPassword())} style={{ border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', cursor: 'pointer', borderRadius: 10, padding: '0 14px', font: '600 12px Manrope' }}>↻</button>
        </div>

        {error && <p style={{ color: 'var(--maroon)', font: '600 12px Manrope', margin: '8px 0 0' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>Cancel</button>
          <button onClick={send} disabled={sending} style={{ flex: 1, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11, opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Sending…' : 'Add & send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
