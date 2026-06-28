import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabaseClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import Tooltip from '../../components/Tooltip.jsx';

function findKey(keys, patterns) {
  for (const p of patterns) {
    const k = keys.find((key) => p.test(key.toLowerCase().trim()));
    if (k) return k;
  }
  return null;
}

// Read just the product names from one file (auto-detect the name column; skip total rows).
async function parseNames(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  const nameKey = findKey(keys, [/^name$/, /item.*name/, /product.*name/, /^item$/, /^product$/, /description/, /name/]) || keys[0];
  const out = [];
  for (const r of rows) {
    const name = String(r[nameKey] ?? '').trim();
    if (!name) continue;
    if (/^(grand[\s-]*total|sub[\s-]*total|total|sum|amount)$/i.test(name)) continue; // skip total rows
    out.push(name);
  }
  return out;
}

export default function Products() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  async function loadStats() {
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true });
    setTotal(count || 0);
  }
  async function loadList(q) {
    let req = supabase.from('products').select('id,name').order('name').limit(100);
    if (q && q.trim()) req = req.ilike('name', `${q.trim()}%`);
    const { data } = await req;
    setList(data || []);
  }

  useEffect(() => { loadStats(); loadList(''); }, []);
  useEffect(() => { const t = setTimeout(() => loadList(query), 200); return () => clearTimeout(t); }, [query]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      let names = [];
      for (const f of files) {
        try { names.push(...(await parseNames(f))); } catch { /* skip unreadable file */ }
      }
      if (!names.length) { toast("Couldn't find any product names in the file(s)"); setBusy(false); return; }

      // De-dupe within the upload, tracking repeats.
      const seen = new Map();
      const dup = new Set();
      const unique = [];
      for (const raw of names) {
        const key = raw.toLowerCase();
        if (seen.has(key)) { dup.add(seen.get(key)); continue; }
        seen.set(key, raw); unique.push(raw);
      }
      // Anything already in the catalogue is also a duplicate (skipped, not removed).
      const { data: existing } = await supabase.from('products').select('name');
      const exSet = new Set((existing || []).map((e) => (e.name || '').toLowerCase()));
      unique.forEach((n) => { if (exSet.has(n.toLowerCase())) dup.add(n); });
      const toInsert = unique.filter((n) => !exSet.has(n.toLowerCase()));

      for (let i = 0; i < toInsert.length; i += 500) {
        const batch = toInsert.slice(i, i + 500).map((name) => ({ name }));
        const { error } = await supabase.from('products').upsert(batch, { onConflict: 'name', ignoreDuplicates: true });
        if (error) { toast(`Upload failed: ${error.message}`); setBusy(false); return; }
      }

      const dupList = [...dup];
      setDuplicates(dupList);
      toast(`${toInsert.length} new product${toInsert.length === 1 ? '' : 's'} added${dupList.length ? `, ${dupList.length} duplicate${dupList.length === 1 ? '' : 's'} skipped` : ''}`);
      loadStats(); loadList(query);
    } catch {
      toast('Could not read the file(s)');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteProduct(p) {
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { toast('Could not delete'); return; }
    toast(`${p.name} removed`);
    loadStats(); loadList(query);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Upload */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--shadow)' }}>
        <div style={{ font: '700 14px Manrope', marginBottom: 4 }}>Upload product names</div>
        <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.5 }}>
          Upload one or more Excel/CSV files. Only the <strong>product names</strong> are read (the name column is auto-detected; total rows are ignored). New files <strong>add</strong> to the catalogue — they don't replace it — and duplicate names are skipped. These names power the item search when creating a quotation.
        </p>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        <button onClick={() => fileRef.current.click()} disabled={busy} style={{ border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 13px Manrope', padding: '11px 20px', borderRadius: 11, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Importing…' : '↑ Upload file(s)'}
        </button>
      </div>

      {/* Duplicates from the last upload */}
      {duplicates.length > 0 && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ font: '700 13px Manrope' }}>Duplicates skipped ({duplicates.length})</div>
            <button onClick={() => setDuplicates([])} style={{ border: 'none', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', font: '600 12px Manrope' }}>Dismiss</button>
          </div>
          <p style={{ font: '500 12px Manrope', color: 'var(--ink-3)', margin: '6px 0 10px' }}>Already in the catalogue or repeated in the file — not added again.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
            {duplicates.slice(0, 200).map((d, i) => (
              <span key={i} style={{ font: '600 11px Manrope', color: 'var(--ink-2)', background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 9px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Catalogue list */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: '700 14px Manrope' }}>Catalogue · {total}</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" style={{ flex: 1, maxWidth: 280, boxSizing: 'border-box', padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' }} />
        </div>
        {list.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--ink-3)', font: '500 13px Manrope' }}>No products yet — upload a file above.</div>}
        {list.map((p) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 12, padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ textAlign: 'center' }}>
              <Tooltip label="Delete"><button onClick={() => deleteProduct(p)} style={{ border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--maroon)', cursor: 'pointer', borderRadius: 8, padding: '5px 9px', font: '600 12px Manrope' }}>🗑</button></Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
