// A quotation's look is two independent choices:
//   1. a FONT style (the template cards)            → TEMPLATES
//   2. an ACCENT colour (the colour picker)         → ACCENTS (+ any custom hex)
// buildTpl() combines them into the object QuoteSheet consumes.

export const TEMPLATES = {
  emerald: { id: 'emerald', label: 'Manrope', sub: 'Clean modern sans-serif', font: "'Manrope',sans-serif", mono: "'JetBrains Mono',monospace" },
  helvetica: { id: 'helvetica', label: 'Helvetica', sub: 'Neutral corporate sans', font: "'Helvetica LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif", mono: "'Helvetica LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif" },
  classic: { id: 'classic', label: 'Classic', sub: 'Elegant Georgia serif', font: "Georgia,'Times New Roman',serif", mono: "'JetBrains Mono',monospace" },
};

// The three built-in accent colours; Emerald Green is the default.
export const ACCENTS = [
  { hex: '#22673a', name: 'Emerald Green' },
  { hex: '#1f2937', name: 'Charcoal' },
  { hex: '#7c1825', name: 'Burgundy' },
];

export const DEFAULT_ACCENT = '#22673a';

// Mix a hex colour toward white (amount 0 = colour, 1 = white).
export function tint(hex, amount) {
  const h = (hex || DEFAULT_ACCENT).replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

// Combine the chosen font template + accent colour into the sheet's style object.
export function buildTpl(templateId, accent) {
  const f = TEMPLATES[templateId] || TEMPLATES.emerald;
  const acc = accent || DEFAULT_ACCENT;
  return { font: f.font, mono: f.mono, acc, accSoft: tint(acc, 0.9), theadFg: tint(acc, 0.9) };
}
