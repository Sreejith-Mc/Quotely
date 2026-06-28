import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient.js';

// Item-name input with a type-ahead dropdown of catalogue products (prefix match).
// onType = free text edit; onSelect = a product chosen from the list.
export default function ProductSearchInput({ value, onType, onSelect, placeholder, style }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = (value || '').trim();
    if (q.length < 1) { setResults([]); return; }
    let cancel = false;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id,name')
        .ilike('name', `${q}%`)
        .order('name')
        .limit(8);
      if (!cancel) setResults(data || []);
    }, 180);
    return () => { cancel = true; clearTimeout(t); };
  }, [value]);

  useEffect(() => {
    function onDoc(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        value={value}
        onChange={(e) => { onType(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={style}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow)', maxHeight: 240, overflowY: 'auto' }}>
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(p); setOpen(false); }}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', padding: '9px 12px', textAlign: 'left', font: '600 13px Manrope', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
