import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { TEMPLATES } from '../../components/templates.js';

export default function Templates() {
  const { template, saveTemplate } = useSettings();
  const toast = useToast();

  async function pick(id) {
    const { error } = await saveTemplate(id);
    toast(error ? 'Could not select template' : `${TEMPLATES[id].label} selected`);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {Object.values(TEMPLATES).map((t) => {
        const active = template.selected === t.id;
        return (
          <div
            key={t.id}
            onClick={() => pick(t.id)}
            style={{
              cursor: 'pointer', borderRadius: 16, border: active ? `2px solid ${t.acc}` : '1px solid var(--border)',
              background: 'var(--panel)', boxShadow: 'var(--shadow)', overflow: 'hidden',
            }}
          >
            <div style={{ height: 120, background: t.accSoft, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16, fontFamily: t.font }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: t.acc, marginBottom: 10 }} />
              <div style={{ height: 6, width: '70%', background: t.acc, opacity: 0.5, borderRadius: 3, marginBottom: 6 }} />
              <div style={{ height: 6, width: '50%', background: t.acc, opacity: 0.3, borderRadius: 3 }} />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ font: '700 14px Manrope' }}>{t.label}</div>
                {active && <span style={{ font: '700 10px Manrope', color: t.acc, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active</span>}
              </div>
              <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 3 }}>{t.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
