import { useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Branding() {
  const { company, saveCompany, uploadBrandingFile } = useSettings();
  const toast = useToast();
  const [sealName, setSealName] = useState(company.seal_name || '');
  const [busy, setBusy] = useState('');
  const logoInput = useRef(null);
  const sealInput = useRef(null);

  async function pick(file, kind, urlField) {
    if (!file) return;
    setBusy(kind);
    const { url, error } = await uploadBrandingFile(file, kind);
    if (error) {
      toast(`Could not upload ${kind}`);
      setBusy('');
      return;
    }
    const { error: saveErr } = await saveCompany({ [urlField]: url });
    setBusy('');
    toast(saveErr ? 'Could not save logo' : `${kind === 'logo' ? 'Logo' : 'Seal'} updated`);
  }

  async function saveSealName() {
    const { error } = await saveCompany({ seal_name: sealName });
    toast(error ? 'Could not save seal name' : 'Seal name saved');
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '700 14px Manrope', marginBottom: 4 }}>Company Logo</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 14px' }}>Shown on the letterhead of every new quotation.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 96, height: 96, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {company.logo_url ? <img src={company.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ font: '600 11px Manrope', color: 'var(--ink-3)' }}>No logo</span>}
          </div>
          <input ref={logoInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => pick(e.target.files[0], 'logo', 'logo_url')} />
          <button onClick={() => logoInput.current.click()} disabled={busy === 'logo'} style={btnStyle}>{busy === 'logo' ? 'Uploading…' : 'Upload logo'}</button>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '700 14px Manrope', marginBottom: 4 }}>Authorisation Seal</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 14px' }}>The circular seal printed near the signatory block.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {company.seal_url ? <img src={company.seal_url} alt="Seal" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ font: '600 11px Manrope', color: 'var(--ink-3)' }}>No seal</span>}
          </div>
          <input ref={sealInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => pick(e.target.files[0], 'seal', 'seal_url')} />
          <button onClick={() => sealInput.current.click()} disabled={busy === 'seal'} style={btnStyle}>{busy === 'seal' ? 'Uploading…' : 'Upload seal'}</button>
        </div>
        <label style={{ font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>Seal Name</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={sealName} onChange={(e) => setSealName(e.target.value)} style={{ flex: 1, boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' }} />
          <button onClick={saveSealName} style={btnStyle}>Save</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 12px Manrope', padding: '10px 16px', borderRadius: 10, whiteSpace: 'nowrap' };
