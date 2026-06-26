import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function TaxSettings() {
  const { tax, saveTax } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(tax);
  const [saving, setSaving] = useState(false);

  const total = (parseFloat(form.cgst) || 0) + (parseFloat(form.sgst) || 0);

  async function save() {
    setSaving(true);
    const { error } = await saveTax({ cgst: parseFloat(form.cgst) || 0, sgst: parseFloat(form.sgst) || 0 });
    setSaving(false);
    toast(error ? 'Could not save tax settings' : 'Tax settings saved');
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', maxWidth: 480 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>CGST %</label>
          <input type="number" step="0.5" value={form.cgst} onChange={(e) => setForm((s) => ({ ...s, cgst: e.target.value }))} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>SGST %</label>
          <input type="number" step="0.5" value={form.sgst} onChange={(e) => setForm((s) => ({ ...s, sgst: e.target.value }))} style={fieldStyle} />
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--green-soft)', color: 'var(--green)', font: '600 12px Manrope' }}>
        Combined GST applied to new quotations: {total}%
      </div>
      <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, marginTop: 18, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
