import { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { useToast } from '../context/ToastContext.jsx';

// Lets the signed-in user (employee or admin) change their own password.
export default function ChangePassword() {
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (pw.length < 6) { toast('Password must be at least 6 characters'); return; }
    if (pw !== confirm) { toast('Passwords do not match'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) { toast(error.message || 'Could not change password'); return; }
    setPw('');
    setConfirm('');
    toast('Password updated');
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
      <div style={{ font: '700 14px Manrope', marginBottom: 4 }}>Change Password</div>
      <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 14px' }}>Update the password you use to sign in.</p>
      <label style={labelStyle}>New Password</label>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" style={{ ...fieldStyle, marginBottom: 12 }} />
      <label style={labelStyle}>Confirm New Password</label>
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && save()} style={{ ...fieldStyle, marginBottom: 4 }} />
      <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, marginTop: 14, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
