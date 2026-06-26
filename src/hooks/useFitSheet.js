import { useEffect } from 'react';

// Scales the 794x~1123 A4 sheet down to fit its container so the whole quotation is
// always visible — no scroll — while staying pixel-identical to the exported PDF.
export function useFitSheet(outerRef, wrapRef, innerRef, { maxScale = 1.05, margin = 36 } = {}) {
  useEffect(() => {
    function fit() {
      const o = outerRef.current, w = wrapRef.current, i = innerRef.current;
      if (!o || !w || !i) return;
      const availW = o.clientWidth - margin;
      const availH = o.clientHeight - margin;
      const sheetH = i.offsetHeight || 1123;
      let sc = Math.min(availW / 794, availH / sheetH);
      if (!isFinite(sc) || sc <= 0) sc = 0.5;
      sc = Math.min(sc, maxScale);
      i.style.transform = `scale(${sc})`;
      i.style.transformOrigin = 'top left';
      w.style.width = `${794 * sc}px`;
      w.style.height = `${sheetH * sc}px`;
    }
    fit();
    const t = setTimeout(fit, 80);
    window.addEventListener('resize', fit);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', fit);
    };
  });
}
