import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Styled hover tooltip (replaces the native title="" bubble). Rendered in a portal
// with fixed positioning so it never gets clipped by scroll/overflow containers.
export default function Tooltip({ label, children, place = 'top', style }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  function enter() {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Keep the (up to ~260px wide) tooltip on screen so it never gets shrink-wrapped
    // into a narrow column near the viewport edge.
    const x = Math.min(Math.max(r.left + r.width / 2, 134), window.innerWidth - 134);
    setPos({ x, y: place === 'bottom' ? r.bottom + 8 : r.top - 8 });
    setShow(true);
  }

  if (!label) return children;

  return (
    <span ref={ref} onMouseEnter={enter} onMouseLeave={() => setShow(false)} style={{ display: 'inline-flex', ...style }}>
      {children}
      {show && createPortal(
        <div
          style={{
            position: 'fixed', left: pos.x, top: pos.y,
            transform: `translate(-50%, ${place === 'bottom' ? '0' : '-100%'})`,
            background: 'var(--ink)', color: 'var(--panel)',
            font: '600 11px Manrope', padding: '6px 10px', borderRadius: 8,
            width: 'max-content', maxWidth: 260, lineHeight: 1.4, textAlign: 'center',
            zIndex: 2000, pointerEvents: 'none', boxShadow: 'var(--shadow)',
          }}
        >
          {label}
        </div>,
        document.body,
      )}
    </span>
  );
}
