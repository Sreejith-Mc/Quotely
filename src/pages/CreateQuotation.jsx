import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { supabase } from '../supabaseClient.js';
import { calcItem, formatQuoteNumber, money, todayStr } from '../lib/calc.js';
import { buildSheetData } from '../lib/buildSheetData.js';
import QuoteSheet from '../components/QuoteSheet.jsx';
import PdfOverlay from '../components/PdfOverlay.jsx';
import SuccessOverlay from '../components/SuccessOverlay.jsx';
import { useFitSheet } from '../hooks/useFitSheet.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

let uidCounter = 1;

export default function CreateQuotation() {
  const navigate = useNavigate();
  const { loggedIn, profile, session } = useAuth();
  const { company, tax, numbering, terms, template, reload } = useSettings();
  const toast = useToast();
  const isMobile = useIsMobile();

  const [cust, setCust] = useState({ name: '', company: '', address: '', phone: '', email: '' });
  const [items, setItems] = useState([]);
  const [manualGst, setManualGst] = useState(false);
  const [showAmount, setShowAmount] = useState(true);
  const [custOpen, setCustOpen] = useState(true);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const outerRef = useRef(null);
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  const salesStaff = loggedIn && profile ? profile.name : 'Not Assigned';
  const quoteNoPreview = formatQuoteNumber(numbering.prefix, numbering.next_number, numbering.pad);
  const today = todayStr();

  function addItem() {
    setItems((arr) => [...arr, { id: uidCounter++, name: '', qty: 1, total: 0 }]);
  }
  function delItem(id) {
    setItems((arr) => arr.filter((it) => it.id !== id));
  }
  function dupItem(id) {
    setItems((arr) => {
      const it = arr.find((x) => x.id === id);
      if (!it) return arr;
      const idx = arr.findIndex((x) => x.id === id);
      const copy = { ...it, id: uidCounter++ };
      const next = [...arr];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }
  function setItemField(id, key, value) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, [key]: key === 'name' ? value : value === '' ? '' : parseFloat(value) || 0 } : it)));
  }
  function toggleManual() {
    setManualGst((m) => {
      if (!m) {
        setItems((arr) => arr.map((it) => {
          const c = calcItem(it, tax, false);
          return { ...it, rate: it.rate !== undefined ? it.rate : Math.round(c.rate), cgst: it.cgst !== undefined ? it.cgst : Math.round(c.cgst), sgst: it.sgst !== undefined ? it.sgst : Math.round(c.sgst) };
        }));
      }
      return !m;
    });
  }

  const sheetData = useMemo(() => buildSheetData({
    company, cust, items, tax, manualGst, showAmount, terms: terms.content || '', templateId: template.selected,
    quoteNo: quoteNoPreview, date: today, salesStaff,
  }), [company, cust, items, tax, manualGst, showAmount, terms, template, quoteNoPreview, today, salesStaff]);

  useFitSheet(outerRef, wrapRef, innerRef, { maxScale: 1.05, margin: 36 });

  function doPrint() {
    setPdfOpen(true);
    setTimeout(() => window.print(), 200);
  }
  function downloadPdf() {
    toast('Opening print dialog — choose "Save as PDF"');
    setTimeout(() => window.print(), 250);
  }

  async function generate() {
    if (!loggedIn) {
      toast('Sign in as an employee to save this quotation');
      navigate('/login');
      return;
    }
    if (!cust.name.trim()) {
      toast('Customer name is required');
      return;
    }
    if (items.length === 0) {
      toast('Add at least one item');
      return;
    }
    setSaving(true);
    const { data: number, error: numErr } = await supabase.rpc('next_quote_number');
    if (numErr) {
      toast('Could not generate quotation — try again');
      setSaving(false);
      return;
    }
    const t = sheetData._totals;
    const { error: insErr } = await supabase.from('quotations').insert({
      number,
      sales_staff_id: session.user.id,
      sales_staff_name: profile?.name || 'Not Assigned',
      customer_name: cust.name,
      customer_company: cust.company,
      customer_address: cust.address,
      customer_phone: cust.phone,
      customer_email: cust.email,
      items,
      manual_gst: manualGst,
      show_amount: showAmount,
      subtotal: t.subBase,
      cgst_total: t.cgstT,
      sgst_total: t.sgstT,
      grand_total: t.grand,
    });
    setSaving(false);
    if (insErr) {
      toast('Could not save quotation');
      return;
    }
    await reload();
    setSuccess({ number, grandTotal: money(t.grand) });
  }

  function newQuote() {
    setSuccess(null);
    setItems([]);
    setCust({ name: '', company: '', address: '', phone: '', email: '' });
  }

  const gstMode = manualGst ? 'Manual' : 'Auto GST';
  const cgstLabel = sheetData.cgstLabel, sgstLabel = sheetData.sgstLabel;

  return (
    <div style={isMobile
      ? { display: 'flex', flexDirection: 'column' }
      : { display: 'grid', gridTemplateColumns: 'minmax(380px,42fr) 58fr', alignItems: 'stretch', minHeight: 'calc(100vh - 62px)' }}>
      {/* LEFT: builder */}
      <div style={{ padding: isMobile ? 16 : 24, overflow: isMobile ? 'visible' : 'auto', maxHeight: isMobile ? 'none' : 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>New Quotation</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>Fill in the details — the document on the right updates live.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Chip label="Quotation No." value={quoteNoPreview} mono accent />
          <Chip label="Date" value={today} mono />
          <Chip label="Sales Staff" value={salesStaff} />
        </div>

        {/* Customer card */}
        <Card>
          <CardHeader icon="①" title="Customer Details" onClick={() => setCustOpen((v) => !v)} chevron={custOpen} />
          {custOpen && (
            <div style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <Field span2 label="Customer Name" required value={cust.name} onChange={(v) => setCust((s) => ({ ...s, name: v }))} placeholder="e.g. Rohan Mehta" />
              <Field label="Company" optional value={cust.company} onChange={(v) => setCust((s) => ({ ...s, company: v }))} placeholder="Apex Manufacturing" />
              <Field label="Phone" optional value={cust.phone} onChange={(v) => setCust((s) => ({ ...s, phone: v }))} placeholder="+91 …" />
              <Field span2 textarea label="Address" optional value={cust.address} onChange={(v) => setCust((s) => ({ ...s, address: v }))} placeholder="Street, City, State, PIN" />
              <Field span2 label="Email" optional value={cust.email} onChange={(v) => setCust((s) => ({ ...s, email: v }))} placeholder="name@company.com" />
            </div>
          )}
        </Card>

        {/* Items card */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={iconBadge}>②</span>
              <span style={{ font: '700 14px Manrope', color: 'var(--ink)' }}>Item Details</span>
              <span style={{ font: '600 11px Manrope', color: 'var(--ink-3)', background: 'var(--panel-2)', borderRadius: 20, padding: '2px 9px' }}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ font: '600 11px Manrope', color: 'var(--ink-2)' }}>Manual GST</span>
              <Switch on={manualGst} onClick={toggleManual} />
            </label>
          </div>

          <div style={{ padding: '0 14px' }}>
            {items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((it, i) => {
                  const c = calcItem(it, tax, manualGst);
                  return (
                    <div key={it.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '11px 12px', background: 'var(--panel-2)', animation: 'rowIn .18s ease' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 6, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 11px 'JetBrains Mono'" }}>{i + 1}</span>
                        <input value={it.name} onChange={(e) => setItemField(it.id, 'name', e.target.value)} placeholder="Item or service name" style={{ ...inputStyle, flex: 1, minWidth: 0, font: '600 13px Manrope' }} />
                        <button onClick={() => delItem(it.id)} title="Delete" style={delBtnStyle}>✕</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8, marginTop: 8, paddingLeft: 30 }}>
                        <div>
                          <div style={subLabelStyle}>Quantity</div>
                          <input value={it.qty} onChange={(e) => setItemField(it.id, 'qty', e.target.value)} inputMode="numeric" style={{ ...inputStyle, font: "600 13px 'JetBrains Mono'" }} />
                        </div>
                        <div>
                          <div style={subLabelStyle}>Total Amount (₹)</div>
                          <input value={it.total} onChange={(e) => setItemField(it.id, 'total', e.target.value)} inputMode="numeric" style={{ ...inputStyle, font: "600 13px 'JetBrains Mono'", textAlign: 'right' }} />
                        </div>
                      </div>
                      {!manualGst ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <span style={{ font: '600 10px Manrope', color: 'var(--ink-3)' }}>Auto:</span>
                          <AutoTag label={`Rate ${money(c.rate)}`} />
                          <AutoTag label={`${cgstLabel} ${money(c.cgst)}`} />
                          <AutoTag label={`${sgstLabel} ${money(c.sgst)}`} />
                          <button onClick={() => dupItem(it.id)} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: 'var(--green)', cursor: 'pointer', font: '600 11px Manrope' }}>⧉ Duplicate</button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginTop: 8 }}>
                          <ManualField label="RATE / UNIT" value={it.rate ?? Math.round(c.rate)} onChange={(v) => setItemField(it.id, 'rate', v)} />
                          <ManualField label={cgstLabel} value={it.cgst ?? Math.round(c.cgst)} onChange={(v) => setItemField(it.id, 'cgst', v)} />
                          <ManualField label={sgstLabel} value={it.sgst ?? Math.round(c.sgst)} onChange={(v) => setItemField(it.id, 'sgst', v)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyItemsState />
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '14px 18px' }}>
            <button onClick={addItem} style={addItemBtnStyle}>+ Add Item</button>
            {items.length > 0 && <button onClick={() => setItems([])} style={clearBtnStyle}>Clear all</button>}
          </div>
        </div>

        {/* Summary card */}
        <div style={{ background: 'var(--green)', borderRadius: 16, padding: '18px 20px', boxShadow: 'var(--shadow)', color: '#eaf3ec', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ font: '700 13px Manrope', color: '#fff' }}>Live Summary</span>
            <span style={{ font: '600 10px Manrope', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{gstMode}</span>
          </div>
          <SummaryRow label="Subtotal" value={sheetData.subtotal} />
          <SummaryRow label={cgstLabel} value={sheetData.cgstTotal} />
          <SummaryRow label={sgstLabel} value={sheetData.sgstTotal} border />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
            <span style={{ font: '800 15px Manrope', color: '#fff' }}>Grand Total</span>
            <span style={{ font: "700 24px 'JetBrains Mono'", color: '#fff' }}>{sheetData.grandTotal}</span>
          </div>
          <div style={{ font: '500 11px Manrope', color: 'rgba(255,255,255,0.7)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.45 }}>{sheetData.grandWords}</div>
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* RIGHT (desktop) / BOTTOM (mobile): quote template preview */}
      <div style={{ background: 'var(--bg)', borderLeft: isMobile ? 'none' : '1px solid var(--border)', borderTop: isMobile ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', maxHeight: isMobile ? 'none' : 'calc(100vh - 62px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '14px 22px', borderBottom: '1px solid var(--border)', background: 'var(--panel)', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ font: '700 13px Manrope', color: 'var(--ink)' }}>Live Preview</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
              <Switch on={showAmount} onClick={() => setShowAmount((v) => !v)} small />
              <span style={{ font: '600 11px Manrope', color: 'var(--ink-2)' }}>Show amounts</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setPdfOpen(true)} style={ghostBtnStyle}>⤢ Preview</button>
            <button onClick={doPrint} style={ghostBtnStyle}>⎙ Print</button>
            <button onClick={downloadPdf} style={primaryBtnStyle}>↓ Download PDF</button>
          </div>
        </div>
        <div ref={outerRef} style={{ flex: 1, overflow: 'hidden', padding: isMobile ? 12 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: isMobile ? '82vh' : undefined }}>
          <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(20,40,28,0.10),0 18px 50px rgba(20,40,28,0.16)', borderRadius: 3 }}>
            <div ref={innerRef} style={{ width: 794, background: '#fff' }}>
              <QuoteSheet data={sheetData} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '12px 22px', borderTop: '1px solid var(--border)', background: 'var(--panel)', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ font: '500 11px Manrope', color: 'var(--ink-3)' }}>Fits to view · exported as pixel-perfect A4 PDF</span>
          <button onClick={generate} disabled={saving} style={{ ...primaryBtnStyle, padding: '10px 20px', borderRadius: 11, fontSize: 13, opacity: saving ? 0.7 : 1, flex: isMobile ? 1 : undefined }}>
            {saving ? 'Generating…' : 'Generate Quotation →'}
          </button>
        </div>
      </div>

      <PdfOverlay open={pdfOpen} onClose={() => setPdfOpen(false)} sheetData={sheetData} onDownload={downloadPdf} onPrint={() => window.print()} />
      <SuccessOverlay open={!!success} number={success?.number} grandTotal={success?.grandTotal} onClose={() => setSuccess(null)} onNewQuote={newQuote} />
    </div>
  );
}

function Chip({ label, value, mono, accent }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 14px' }}>
      <div style={{ font: '600 10px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      <div style={{ font: mono ? "600 14px 'JetBrains Mono'" : '700 13px Manrope', color: accent ? 'var(--green)' : 'var(--ink)', marginTop: 3 }}>{value}</div>
    </div>
  );
}
function Card({ children }) {
  return <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden', flexShrink: 0 }}>{children}</div>;
}
function CardHeader({ icon, title, onClick, chevron }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', padding: '16px 18px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={iconBadge}>{icon}</span>
        <span style={{ font: '700 14px Manrope', color: 'var(--ink)' }}>{title}</span>
      </span>
      <span style={{ color: 'var(--ink-3)', fontSize: 13, transition: 'transform .2s', transform: `rotate(${chevron ? '0deg' : '-90deg'})` }}>▾</span>
    </button>
  );
}
function Field({ label, required, optional, value, onChange, placeholder, span2, textarea }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div style={span2 ? { gridColumn: '1/3' } : undefined}>
      <label style={{ font: '600 11px Manrope', color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--green)', fontWeight: 700 }}>*</span>}
        {optional && <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>(optional)</span>}
      </label>
      <Tag value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={textarea ? 2 : undefined} style={{ ...inputStyle, resize: textarea ? 'vertical' : undefined }} />
    </div>
  );
}
function ManualField({ label, value, onChange }) {
  return (
    <div>
      <div style={{ font: '600 9px Manrope', color: 'var(--ink-3)', marginBottom: 3 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="numeric" style={{ ...inputStyle, padding: '7px 9px', font: "500 12px 'JetBrains Mono'", borderRadius: 8 }} />
    </div>
  );
}
function AutoTag({ label }) {
  return <span style={{ font: "500 10.5px 'JetBrains Mono'", color: 'var(--ink-2)', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 8px' }}>{label}</span>;
}
function Switch({ on, onClick, small }) {
  const w = small ? 36 : 38, h = small ? 21 : 22, knob = small ? 17 : 18;
  return (
    <span onClick={onClick} style={{ width: w, height: h, borderRadius: 20, background: on ? 'var(--green)' : 'var(--border)', position: 'relative', transition: '.2s', display: 'inline-block', flexShrink: 0, cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? `${w - knob - 2}px` : '2px', width: knob, height: knob, borderRadius: '50%', background: '#fff', transition: '.2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
    </span>
  );
}
function SummaryRow({ label, value, border }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px Manrope', padding: '4px 0', borderBottom: border ? '1px solid rgba(255,255,255,0.16)' : undefined, paddingBottom: border ? 10 : undefined }}>
      <span style={{ color: 'rgba(255,255,255,0.78)' }}>{label}</span><span style={{ fontFamily: "'JetBrains Mono'" }}>{value}</span>
    </div>
  );
}
function EmptyItemsState() {
  return (
    <div style={{ textAlign: 'center', padding: '30px 16px' }}>
      <div style={{ position: 'relative', width: 64, height: 54, margin: '0 auto 14px' }}>
        <div style={{ position: 'absolute', inset: '0 8px', border: '1.5px dashed var(--border)', borderRadius: 8, transform: 'rotate(-7deg)' }} />
        <div style={{ position: 'absolute', inset: '0 8px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--panel)', transform: 'rotate(4deg)' }} />
      </div>
      <div style={{ font: '700 13px Manrope', color: 'var(--ink)' }}>No items added yet</div>
      <div style={{ font: '500 12px Manrope', color: 'var(--ink-3)', marginTop: 3 }}>Add your first line item to start building the quote.</div>
    </div>
  );
}

const iconBadge = { width: 26, height: 26, borderRadius: 8, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--ink)', borderRadius: 10, font: '500 13px Manrope', outline: 'none' };
const subLabelStyle = { font: '600 9px Manrope', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 };
const delBtnStyle = { width: 30, height: 30, flexShrink: 0, border: 'none', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', borderRadius: 8, fontSize: 15 };
const addItemBtnStyle = { flex: 1, border: '1.5px dashed var(--green)', background: 'var(--green-soft)', color: 'var(--green)', cursor: 'pointer', font: '700 13px Manrope', padding: 11, borderRadius: 11 };
const clearBtnStyle = { border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink-2)', cursor: 'pointer', font: '600 13px Manrope', padding: '11px 16px', borderRadius: 11 };
const ghostBtnStyle = { border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--ink)', cursor: 'pointer', font: '600 12px Manrope', padding: '8px 13px', borderRadius: 9 };
const primaryBtnStyle = { border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', font: '700 12px Manrope', padding: '8px 14px', borderRadius: 9 };
