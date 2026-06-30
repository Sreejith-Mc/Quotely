import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import ChangePassword from '../../components/ChangePassword.jsx';

export default function SettingsTab() {
  const { dark, toggleDark } = useTheme();
  const { profit, saveProfit } = useSettings();
  const toast = useToast();

  const [margin, setMargin] = useState('');
  const [empSee, setEmpSee] = useState(false);
  const [savingProfit, setSavingProfit] = useState(false);

  useEffect(() => {
    setMargin(profit.margin_percent != null ? String(profit.margin_percent) : '');
    setEmpSee(!!profit.employees_can_see);
  }, [profit]);

  async function onSaveProfit() {
    setSavingProfit(true);
    const { error } = await saveProfit({
      margin_percent: parseFloat(margin) || 0,
      employees_can_see: empSee,
    });
    setSavingProfit(false);
    toast(error ? 'Could not save profit settings' : 'Profit settings saved');
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ font: '700 14px Manrope' }}>Dark Mode</div>
            <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 2 }}>Applies to your account on this device.</div>
          </div>
          <button
            onClick={toggleDark}
            style={{
              width: 46, height: 26, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
              background: dark ? 'var(--green)' : 'var(--border)', transition: 'background 0.15s',
            }}
          >
            <span style={{ position: 'absolute', top: 3, left: dark ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
          </button>
        </div>
      </div>

      {/* Profit / margin */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '700 14px Manrope' }}>Profit &amp; Margin</div>
        <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.5 }}>
          Profit is calculated as this percentage of each quotation&apos;s pre-GST subtotal. It only appears on the <strong>Admin Export</strong> — never on the customer&apos;s quote.
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Default margin (%)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              style={{ width: 120, boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: "600 14px 'JetBrains Mono'", outline: 'none' }}
            />
            <span style={{ font: '600 13px Manrope', color: 'var(--ink-3)' }}>%</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ font: '700 13px Manrope' }}>Let employees see profit</div>
            <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 2, maxWidth: 300, lineHeight: 1.45 }}>
              Off by default — only admins can set the margin and use the Admin Export.
            </div>
          </div>
          <button
            onClick={() => setEmpSee((v) => !v)}
            style={{
              width: 46, height: 26, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: empSee ? 'var(--green)' : 'var(--border)', transition: 'background 0.15s',
            }}
          >
            <span style={{ position: 'absolute', top: 3, left: empSee ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
          </button>
        </div>

        <button
          onClick={onSaveProfit}
          disabled={savingProfit}
          style={{ marginTop: 18, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, opacity: savingProfit ? 0.7 : 1 }}
        >
          {savingProfit ? 'Saving…' : 'Save profit settings'}
        </button>
      </div>

      <ChangePassword />
    </div>
  );
}
