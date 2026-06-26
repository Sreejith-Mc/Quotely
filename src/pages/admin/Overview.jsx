import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { money } from '../../lib/calc.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const STATUSES = ['Draft', 'Sent', 'Accepted'];

export default function Overview() {
  const toast = useToast();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [history, setHistory] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const [statRes, recentRes, histRes] = await Promise.all([
      supabase.rpc('dashboard_stats'),
      supabase.from('quotations').select('id,number,customer_name,grand_total,status,created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('quotation_audit').select('id,quotation_number,actor_name,action,created_at').order('created_at', { ascending: false }).limit(12),
    ]);
    const s = statRes.data || {};
    setStats([
      { label: 'Quotations · this month', value: String(s.monthCount ?? 0), delta: '' },
      { label: 'Value Quoted', value: money(s.monthValue ?? 0), delta: '' },
      { label: 'Active Employees', value: String(s.activeEmployees ?? 0), delta: `of ${s.totalEmployees ?? 0} total` },
    ]);
    setRecent(recentRes.data || []);
    setHistory(histRes.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function quickStatus(q, status) {
    if (status === q.status) return;
    const { error } = await supabase.from('quotations').update({ status }).eq('id', q.id);
    if (error) { toast('Could not update status'); return; }
    toast(`${q.number} marked ${status}`);
    load();
  }

  async function saveEdit(patch) {
    const { error } = await supabase.from('quotations').update(patch).eq('id', editing.id);
    if (error) { toast('Could not save changes'); return; }
    setEditing(null);
    toast(`${editing.number} updated`);
    load();
  }

  if (!stats) return null;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
        {stats.map((st) => (
          <div key={st.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ font: '600 11px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.label}</div>
            <div style={{ font: "800 26px 'JetBrains Mono'", color: 'var(--ink)', margin: '8px 0 2px' }}>{st.value}</div>
            {st.delta && <div style={{ font: '600 11px Manrope', color: 'var(--green)' }}>{st.delta}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, marginTop: 16, alignItems: 'start' }}>
        {/* Recent quotations — editable */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', font: '700 14px Manrope' }}>Recent Quotations</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 520 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 130px 60px', padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                <div>Number</div><div>Customer</div><div style={{ textAlign: 'right' }}>Amount</div><div>Status</div><div></div>
              </div>
              {recent.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No quotations yet.</div>}
              {recent.map((q) => (
                <div key={q.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 130px 60px', padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13, gap: 6 }}>
                  <div style={{ font: "600 12px 'JetBrains Mono'", color: 'var(--green)' }}>{q.number}</div>
                  <div style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.customer_name}</div>
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono'" }}>{money(q.grand_total)}</div>
                  <div>
                    <select value={q.status} onChange={(e) => quickStatus(q, e.target.value)} style={{ ...statusSelectStyle, ...statusChip(q.status) }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => setEditing(q)} title="Edit" style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink-2)', cursor: 'pointer', borderRadius: 8, padding: '5px 9px', font: '600 12px Manrope' }}>✎</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity history */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', font: '700 14px Manrope' }}>Activity History</div>
          {history.length === 0 && <div style={{ padding: '20px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No edits yet. Changes to quotations show up here.</div>}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: 'flex', gap: 11, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: '500 12.5px Manrope', color: 'var(--ink)', lineHeight: 1.45 }}>
                    <strong style={{ fontWeight: 700 }}>{h.actor_name}</strong> {h.action}
                    {' '}<span style={{ fontFamily: "'JetBrains Mono'", color: 'var(--green)', fontSize: 11 }}>{h.quotation_number}</span>
                  </div>
                  <div style={{ font: '500 11px Manrope', color: 'var(--ink-3)', marginTop: 2 }}>{timeAgo(h.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing && <EditModal q={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </>
  );
}

function EditModal({ q, onClose, onSave }) {
  const [name, setName] = useState(q.customer_name || '');
  const [grand, setGrand] = useState(q.grand_total ?? 0);
  const [status, setStatus] = useState(q.status);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: 'var(--panel)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '800 17px Manrope', marginBottom: 2 }}>Edit Quotation</div>
        <div style={{ font: "600 12px 'JetBrains Mono'", color: 'var(--green)', marginBottom: 16 }}>{q.number}</div>

        <label style={labelStyle}>Customer Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...fieldStyle, marginBottom: 12 }} />
        <label style={labelStyle}>Grand Total (₹)</label>
        <input value={grand} onChange={(e) => setGrand(e.target.value)} inputMode="numeric" style={{ ...fieldStyle, marginBottom: 12, fontFamily: "'JetBrains Mono'" }} />
        <label style={labelStyle}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...fieldStyle, marginBottom: 4 }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>Cancel</button>
          <button onClick={() => onSave({ customer_name: name, grand_total: parseFloat(grand) || 0, status })} style={{ flex: 1, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

function statusChip(status) {
  if (status === 'Accepted') return { background: 'var(--green-soft)', color: 'var(--green)' };
  if (status === 'Draft') return { background: 'rgba(124,24,37,0.08)', color: 'var(--maroon)' };
  return { background: 'var(--panel-2)', color: 'var(--ink-2)' };
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const statusSelectStyle = { border: 'none', cursor: 'pointer', font: '600 11px Manrope', padding: '5px 8px', borderRadius: 20, outline: 'none', appearance: 'none', textAlign: 'center', width: '100%' };
const labelStyle = { font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 5 };
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
