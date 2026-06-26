import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { supabase } from '../supabaseClient.js';
import { initialsOf } from '../lib/calc.js';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: profile?.name || '', email: profile?.email || '', phone: profile?.phone || '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name: form.name, phone: form.phone }).eq('id', profile.id);
    setSaving(false);
    if (error) {
      toast('Could not save profile');
      return;
    }
    await refreshProfile();
    toast('Profile saved');
    navigate('/');
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ font: '800 24px Manrope', letterSpacing: '-0.02em', margin: '0 0 4px' }}>My Profile</h1>
      <p style={{ font: '500 13px Manrope', color: 'var(--ink-2)', margin: '0 0 20px' }}>Your name appears as Sales Staff on every quotation you create.</p>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 20px Manrope' }}>{initialsOf(form.name)}</span>
        </div>
        <div>
          <label style={labelStyle}>Name</label>
          <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={form.email} disabled style={{ ...fieldStyle, opacity: 0.6 }} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} style={fieldStyle} />
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11, marginTop: 4, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
