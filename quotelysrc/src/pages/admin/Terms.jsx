import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Terms() {
  const { terms, saveTerms } = useSettings();
  const toast = useToast();
  const [content, setContent] = useState(terms.content || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await saveTerms(content);
    setSaving(false);
    toast(error ? 'Could not save terms' : 'Terms saved');
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)', maxWidth: 640 }}>
      <label style={{ font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>Default Terms &amp; Conditions</label>
      <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 10px' }}>One line per term. Printed at the bottom of every quotation.</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
      />
      <button onClick={save} disabled={saving} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, marginTop: 14, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
