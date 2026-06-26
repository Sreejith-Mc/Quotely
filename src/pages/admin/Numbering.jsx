import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatQuoteNumber } from '../../lib/calc.js';

export default function Numbering() {
  const { numbering, saveNumbering } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(numbering);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await saveNumbering({
      prefix: form.prefix, next_number: parseInt(form.next_number, 10) || 1, pad: parseInt(form.pad, 10) || 1,
    });
    setSaving(false);
    toast(error ? 'Could not save numbering settings' : 'Numbering settings saved');
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', maxWidth: 480 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Prefix</label>
          <input value={form.prefix} onChange={(e) => setForm((s) => ({ ...s, prefix: e.target.value }))} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Next Number</label>
          <input type="number" value={form.next_number} onChange={(e) => setForm((s) => ({ ...s, next_number: e.target.value }))} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Pad Digits</label>
          <input type="number" value={form.pad} onChange={(e) => setForm((s) => ({ ...s, pad: e.target.value }))} style={fieldStyle} />
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'var(--green-soft)', color: 'var(--green)', font: '700 14px JetBrains Mono' }}>
        Next quotation number: {formatQuoteNumber(form.prefix, form.next_number, parseInt(form.pad, 10) || 1)}
      </div>
      <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, marginTop: 18, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
