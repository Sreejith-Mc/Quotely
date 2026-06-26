import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { money } from '../../lib/calc.js';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [{ data: monthRows }, { data: empRows }, { data: recentRows }] = await Promise.all([
        supabase.from('quotations').select('grand_total').gte('created_at', startOfMonth.toISOString()),
        supabase.from('profiles').select('active'),
        supabase.from('quotations').select('number,customer_name,grand_total,status').order('created_at', { ascending: false }).limit(5),
      ]);

      const count = monthRows?.length || 0;
      const value = (monthRows || []).reduce((s, r) => s + Number(r.grand_total || 0), 0);
      const activeEmp = (empRows || []).filter((e) => e.active).length;

      setStats([
        { label: 'Quotations · this month', value: String(count), delta: '' },
        { label: 'Value Quoted', value: money(value), delta: '' },
        { label: 'Active Employees', value: String(activeEmp), delta: `of ${empRows?.length || 0} total` },
      ]);
      setRecent(recentRows || []);
    })();
  }, []);

  if (!stats) return null;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {stats.map((st) => (
          <div key={st.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ font: '600 11px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.label}</div>
            <div style={{ font: "800 26px 'JetBrains Mono'", color: 'var(--ink)', margin: '8px 0 2px' }}>{st.value}</div>
            {st.delta && <div style={{ font: '600 11px Manrope', color: 'var(--green)' }}>{st.delta}</div>}
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', marginTop: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', font: '700 14px Manrope' }}>Recent Quotations</div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 110px', padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
          <div>Number</div><div>Customer</div><div style={{ textAlign: 'right' }}>Amount</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {recent.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No quotations yet.</div>}
        {recent.map((q) => (
          <div key={q.number} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 110px', padding: '13px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ font: "600 12px 'JetBrains Mono'", color: 'var(--green)' }}>{q.number}</div>
            <div style={{ fontWeight: 600 }}>{q.customer_name}</div>
            <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono'" }}>{money(q.grand_total)}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ font: '600 11px Manrope', padding: '3px 10px', borderRadius: 20, ...statusChip(q.status) }}>{q.status}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function statusChip(status) {
  if (status === 'Accepted') return { background: 'var(--green-soft)', color: 'var(--green)' };
  if (status === 'Draft') return { background: 'rgba(124,24,37,0.08)', color: 'var(--maroon)' };
  return { background: 'var(--panel-2)', color: 'var(--ink-2)' };
}
