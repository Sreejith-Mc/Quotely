import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabaseClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { money } from '../../lib/calc.js';

function findKey(keys, patterns) {
  for (const p of patterns) {
    const k = keys.find((key) => p.test(key.toLowerCase().trim()));
    if (k) return k;
  }
  return null;
}

export default function Products() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, out: 0 });
  const [query, setQuery] = useState('');
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  async function loadStats() {
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true });
    const { count: outCount } = await supabase.from('products').select('id', { count: 'exact', head: true }).lte('stock', 0);
    setStats({ total: count || 0, out: outCount || 0 });
  }
  async function loadList(q) {
    let req = supabase.from('products').select('id,name,sku,price,stock').order('name').limit(50);
    if (q && q.trim()) req = req.ilike('name', `${q.trim()}%`);
    const { data } = await req;
    setList(data || []);
  }

  useEffect(() => { loadStats(); loadList(''); }, []);
  useEffect(() => { const t = setTimeout(() => loadList(query), 200); return () => clearTimeout(t); }, [query]);

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) { toast('That file has no rows'); setBusy(false); return; }

      const keys = Object.keys(rows[0]);
      const nameKey = findKey(keys, [/^name$/, /item.*name/, /product.*name/, /^item$/, /^product$/, /description/, /name/]);
      const skuKey = findKey(keys, [/sku/, /^code$/, /item.*code/, /part.*no/, /^id$/]);
      const priceKey = findKey(keys, [/price/, /^rate$/, /mrp/, /unit.*price/, /amount/, /cost/]);
      const stockKey = findKey(keys, [/stock/, /qty/, /quantity/, /available/, /balance/, /on.?hand/]);

      if (!nameKey) { toast("Couldn't find a product-name column in that file"); setBusy(false); return; }

      const num = (v) => Number(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;
      const seen = new Set();
      const products = [];
      for (const r of rows) {
        const name = String(r[nameKey] ?? '').trim();
        if (!name || seen.has(name.toLowerCase())) continue; // skip blanks/dupes (last upload wins per name)
        seen.add(name.toLowerCase());
        products.push({
          name,
          sku: skuKey ? String(r[skuKey] ?? '').trim() || null : null,
          price: priceKey ? num(r[priceKey]) : 0,
          stock: stockKey ? num(r[stockKey]) : 0,
          updated_at: new Date().toISOString(),
        });
      }
      if (!products.length) { toast('No valid product rows found'); setBusy(false); return; }

      // Upsert in batches (updates existing by name, adds new) — keeps ids stable.
      for (let i = 0; i < products.length; i += 500) {
        const batch = products.slice(i, i + 500);
        const { error } = await supabase.from('products').upsert(batch, { onConflict: 'name' });
        if (error) { toast(`Upload failed: ${error.message}`); setBusy(false); return; }
      }
      // Replace: remove any catalogue items that aren't in this new file.
      const newNames = new Set(products.map((p) => p.name.toLowerCase()));
      const { data: existing } = await supabase.from('products').select('id,name');
      const toDelete = (existing || []).filter((e) => !newNames.has((e.name || '').toLowerCase())).map((e) => e.id);
      for (let i = 0; i < toDelete.length; i += 200) {
        await supabase.from('products').delete().in('id', toDelete.slice(i, i + 200));
      }
      toast(`Catalogue replaced — ${products.length} products${toDelete.length ? `, ${toDelete.length} removed` : ''}${stockKey ? '' : ' (no stock column — set to 0)'}`);
      loadStats(); loadList(query);
    } catch (e) {
      toast('Could not read that file');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Upload */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '700 14px Manrope', marginBottom: 4 }}>Upload stock list</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.5 }}>
          Upload an Excel/CSV export from your system. Columns are auto-detected — include a <strong>Name</strong> column (required), and optionally <strong>SKU/Code</strong>, <strong>Price</strong>, and <strong>Stock/Qty</strong>. Re-uploading <strong>replaces the catalogue</strong> with this file: existing items are updated, new ones added, and items not in the file are removed.
        </p>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        <button onClick={() => fileRef.current.click()} disabled={busy} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Importing…' : '↑ Upload Excel / CSV'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
        {[{ label: 'Products', value: String(stats.total) }, { label: 'Out of stock', value: String(stats.out) }].map((st) => (
          <div key={st.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--shadow)' }}>
            <div style={{ font: '600 11px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.label}</div>
            <div style={{ font: "800 26px 'JetBrains Mono'", color: 'var(--ink)', marginTop: 6 }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: '700 14px Manrope' }}>Catalogue</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" style={{ flex: 1, maxWidth: 280, boxSizing: 'border-box', padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 480 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px', gap: 12, padding: '11px 18px', font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
              <div>Name</div><div>SKU</div><div style={{ textAlign: 'right' }}>Price</div><div style={{ textAlign: 'right' }}>Stock</div>
            </div>
            {list.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No products yet — upload a file above.</div>}
            {list.map((p) => {
              const out = Number(p.stock) <= 0;
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px', gap: 12, padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ color: 'var(--ink-3)', font: "500 12px 'JetBrains Mono'", minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.sku || '—'}</div>
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono'" }}>{money(p.price)}</div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ font: "600 11px Manrope", color: out ? 'var(--maroon)' : 'var(--green)', background: out ? 'rgba(124,24,37,0.1)' : 'var(--green-soft)', padding: '2px 9px', borderRadius: 20 }}>{out ? 'Out' : p.stock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
