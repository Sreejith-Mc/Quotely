import { useEffect, useRef } from 'react';
import QuoteSheet from './QuoteSheet.jsx';

export default function PdfOverlay({ open, onClose, sheetData, onDownload, onPrint }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function fitPdf() {
      const w = wrapRef.current, i = innerRef.current;
      if (!w || !i) return;
      const availW = Math.min(window.innerWidth - 56, 920);
      const availH = window.innerHeight - 128;
      const sheetH = i.offsetHeight || 1123;
      let sc = Math.min(availW / 794, availH / sheetH);
      if (!isFinite(sc) || sc <= 0) sc = 0.7;
      sc = Math.min(sc, 1.15);
      i.style.transform = `scale(${sc})`;
      i.style.transformOrigin = 'top left';
      w.style.width = `${794 * sc}px`;
      w.style.height = `${sheetH * sc}px`;
    }
    fitPdf();
    const t = setTimeout(fitPdf, 90);
    window.addEventListener('resize', fitPdf);
    return () => { clearTimeout(t); window.removeEventListener('resize', fitPdf); };
  }, [open, sheetData]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(12,16,14,0.62)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(14px,3vw,28px)', overflow: 'auto', animation: 'fadeIn .14s', backdropFilter: 'blur(3px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ font: '700 13px Manrope', color: '#fff' }}>PDF Preview · {sheetData.quoteNo}</span>
        <button onClick={(e) => { e.stopPropagation(); onDownload(); }} style={{ border: 'none', background: '#fff', color: 'var(--green)', cursor: 'pointer', font: '700 12px Manrope', padding: '8px 14px', borderRadius: 9 }}>↓ Download</button>
        <button onClick={(e) => { e.stopPropagation(); onPrint(); }} style={{ border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer', font: '700 12px Manrope', padding: '8px 14px', borderRadius: 9 }}>⎙ Print</button>
        <button onClick={onClose} style={{ border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer', font: '700 12px Manrope', padding: '8px 14px', borderRadius: 9 }}>✕ Close</button>
      </div>
      <div className="print-sheet" ref={wrapRef} onClick={(e) => e.stopPropagation()} style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', borderRadius: 3 }}>
        <div ref={innerRef} style={{ width: 794, background: '#fff' }}>
          <QuoteSheet data={sheetData} />
        </div>
      </div>
    </div>
  );
}
