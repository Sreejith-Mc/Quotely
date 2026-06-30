import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import { money } from '../../lib/calc.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import Tooltip from '../../components/Tooltip.jsx';

const STATUSES = ['Draft', 'Sent', 'Accepted'];

export default function Overview() {
  const toast = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAdmin, session } = useAuth();
  const userId = session?.user?.id;
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // RLS already restricts employees to their own rows, but we also scope the
    // queries explicitly so the stats and lists stay consistent.
    let monthQ = supabase.from('quotations').select('grand_total').gte('created_at', monthStart.toISOString());
    let recentQ = supabase.from('quotations').select('id,number,customer_name,sales_staff_name,grand_total,status,created_at').order('created_at', { ascending: false }).limit(8);
    if (!isAdmin && userId) {
      monthQ = monthQ.eq('sales_staff_id', userId);
      recentQ = recentQ.eq('sales_staff_id', userId);
    }

    const [monthRes, statRes, recentRes, histRes] = await Promise.all([
      monthQ,
      supabase.rpc('dashboard_stats'),
      recentQ,
      supabase.from('quotation_audit').select('id,quotation_number,actor_name,action,created_at').order('created_at', { ascending: false }).limit(12),
    ]);

    const monthRows = monthRes.data || [];
    const count = monthRows.length;
    const value = monthRows.reduce((sum, r) => sum + Number(r.grand_total || 0), 0);
    const s = statRes.data || {};
    setStats([
      { label: isAdmin ? 'Quotations · this month' : 'My quotations · this month', value: String(count), delta: '' },
      { label: isAdmin ? 'Value Quoted' : 'Value I Quoted', value: money(value), delta: '' },
      { label: 'Active Employees', value: String(s.activeEmployees ?? 0), delta: `of ${s.totalEmployees ?? 0} total` },
    ]);
    setRecent(recentRes.data || []);
    setHistory(histRes.data || []);
  }, [isAdmin, userId]);

  useEffect(() => { load(); }, [load]);

  async function quickStatus(q, status) {
    if (status === q.status) return;
    const { error } = await supabase.from('quotations').update({ status }).eq('id', q.id);
    if (error) { toast('Could not update status'); return; }
    toast(`${q.number} marked ${status}`);
    load();
  }

  async function confirmDelete() {
    const q = pendingDelete;
    setPendingDelete(null);
    if (!q) return;
    const { error } = await supabase.from('quotations').delete().eq('id', q.id);
    if (error) { toast('Could not delete quotation'); return; }
    toast(`${q.number} deleted`);
    load();
  }

  if (!stats) return null;

  // Admins get an extra "Created By" column on the recent list.
  const recentCols = isAdmin ? '110px 1fr 130px 110px 120px 86px' : '110px 1fr 110px 120px 86px';
  const recentMinW = isAdmin ? 680 : 540;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
        {stats.map((st) => (
          <div key={st.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--shadow)', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ font: '600 11px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.label}</div>
            <StatValue value={st.value} />
            {st.delta && <div style={{ font: '600 11px Manrope', color: 'var(--green)' }}>{st.delta}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, marginTop: 16, alignItems: 'start' }}>
        {/* Recent quotations — editable */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', font: '700 14px Manrope' }}>Recent Quotations</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: recentMinW }}>
              <div style={{ display: 'grid', gridTemplateColumns: recentCols, gap: 12, padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                <div>Number</div><div>Customer</div>{isAdmin && <div>Created By</div>}<div style={{ textAlign: 'right' }}>Amount</div><div>Status</div><div></div>
              </div>
              {recent.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No quotations yet.</div>}
              {recent.map((q) => (
                <div key={q.id} style={{ display: 'grid', gridTemplateColumns: recentCols, gap: 12, padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div style={{ font: "600 12px 'JetBrains Mono'", color: 'var(--green)' }}>{q.number}</div>
                  <div style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.customer_name}</div>
                  {isAdmin && <div style={{ color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.sales_staff_name || '—'}</div>}
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono'" }}>{money(q.grand_total)}</div>
                  <div>
                    <select value={q.status} onChange={(e) => quickStatus(q, e.target.value)} style={{ ...statusSelectStyle, ...statusChip(q.status) }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <Tooltip label="Edit"><button onClick={() => navigate(`/edit/${q.id}`)} style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink-2)', cursor: 'pointer', borderRadius: 8, padding: '5px 9px', font: '600 12px Manrope' }}>✎</button></Tooltip>
                    <Tooltip label="Delete"><button onClick={() => setPendingDelete(q)} style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--maroon)', cursor: 'pointer', borderRadius: 8, padding: '5px 9px', font: '600 12px Manrope' }}>🗑</button></Tooltip>
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

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete quotation?"
        message={`${pendingDelete?.number} will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

// Keeps a stat value on a single line, shrinking the font to fit the card width so it
// can hold an arbitrarily long number without wrapping or overflowing.
function StatValue({ value }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const box = boxRef.current, text = textRef.current;
    if (!box || !text) return;
    const fit = () => {
      const avail = box.clientWidth;
      const natural = text.scrollWidth;
      setScale(natural > avail && natural > 0 ? avail / natural : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div ref={boxRef} style={{ overflow: 'hidden', margin: '8px 0 2px', height: 30, display: 'flex', alignItems: 'center' }}>
      <span ref={textRef} style={{ display: 'inline-block', whiteSpace: 'nowrap', transformOrigin: 'left center', transform: `scale(${scale})`, font: "800 26px 'JetBrains Mono'", color: 'var(--ink)', lineHeight: 1 }}>{value}</span>
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
