import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const FIELDS = [
  ['name', 'Company Name'],
  ['address', 'Address'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['gst', 'GSTIN'],
];

export default function CompanyInfo() {
  const { company, saveCompany } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(company);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await saveCompany({
      name: form.name, address: form.address, phone: form.phone,
      email: form.email, website: form.website, gst: form.gst,
    });
    setSaving(false);
    toast(error ? 'Could not save company info' : 'Company info saved');
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', maxWidth: 640 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        {FIELDS.map(([key, label]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input value={form[key] || ''} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} style={fieldStyle} />
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, marginTop: 18, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
