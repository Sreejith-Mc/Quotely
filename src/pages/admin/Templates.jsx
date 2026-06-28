import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { TEMPLATES, ACCENTS } from '../../components/templates.js';
import Tooltip from '../../components/Tooltip.jsx';

export default function Templates() {
  const { template, saveTemplate } = useSettings();
  const toast = useToast();
  const accent = template.accent || '#22673a';

  async function pickFont(id) {
    const { error } = await saveTemplate({ selected: id });
    toast(error ? 'Could not save font' : `${TEMPLATES[id].label} font selected`);
  }
  async function pickColor(hex) {
    const { error } = await saveTemplate({ accent: hex });
    toast(error ? 'Could not save colour' : 'Accent colour updated');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Font style */}
      <div>
        <div style={{ font: '700 13px Manrope', marginBottom: 4 }}>Font Style</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 12px' }}>Changes the typography of the quotation — the colour stays as set below.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {Object.values(TEMPLATES).map((t) => {
            const active = template.selected === t.id;
            return (
              <div key={t.id} onClick={() => pickFont(t.id)} style={{ cursor: 'pointer', borderRadius: 16, border: active ? `2px solid ${accent}` : '1px solid var(--border)', background: 'var(--panel)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ height: 110, background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 18, fontFamily: t.font }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.02em' }}>Quotation</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>The quick brown fox · 12,345</div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ font: '700 14px Manrope' }}>{t.label}</div>
                    {active && <span style={{ font: '700 10px Manrope', color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active</span>}
                  </div>
                  <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 3 }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent colour */}
      <div>
        <div style={{ font: '700 13px Manrope', marginBottom: 4 }}>Accent Colour</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 12px' }}>Used for the quotation title, table header and totals.</p>
        <ColorPicker value={accent} onPick={pickColor} />
      </div>
    </div>
  );
}

function ColorPicker({ value, onPick }) {
  const [open, setOpen] = useState(false);
  const current = ACCENTS.find((a) => a.hex.toLowerCase() === (value || '').toLowerCase());

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* The box showing the current colour */}
      <button onClick={() => setOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1px solid var(--border)', background: 'var(--panel)', cursor: 'pointer', padding: '8px 14px 8px 8px', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: value, border: '1px solid rgba(0,0,0,0.1)' }} />
        <span style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', font: '700 13px Manrope', color: 'var(--ink)' }}>{current ? current.name : 'Custom'}</span>
          <span style={{ display: 'block', font: "500 11px 'JetBrains Mono'", color: 'var(--ink-3)' }}>{value}</span>
        </span>
        <span style={{ color: 'var(--ink-3)', fontSize: 12, marginLeft: 4 }}>▾</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 52, left: 0, zIndex: 50, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 12, width: 220 }}>
            <div style={{ font: '700 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Preset colours</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              {ACCENTS.map((a) => {
                const sel = a.hex.toLowerCase() === (value || '').toLowerCase();
                return (
                  <Tooltip key={a.hex} label={a.name}><button onClick={() => { onPick(a.hex); setOpen(false); }} style={{ width: 38, height: 38, borderRadius: 10, background: a.hex, cursor: 'pointer', border: sel ? '3px solid var(--ink)' : '1px solid rgba(0,0,0,0.1)', boxShadow: sel ? '0 0 0 2px var(--panel)' : 'none' }} /></Tooltip>
                );
              })}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 12px Manrope', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="color" value={value} onChange={(e) => onPick(e.target.value)} style={{ width: 30, height: 30, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
              Custom colour
            </label>
          </div>
        </>
      )}
    </div>
  );
}
