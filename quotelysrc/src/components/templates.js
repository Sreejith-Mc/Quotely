// Three selectable quotation looks — same data, different typography/accent.
// Mirrors the TEMPLATES map from the Quotely.dc.html prototype.
export const TEMPLATES = {
  emerald: {
    id: 'emerald', label: 'Emerald', sub: 'Manrope · forest green',
    font: "'Manrope',sans-serif", mono: "'JetBrains Mono',monospace",
    acc: '#22673a', accSoft: '#eef4ef', theadFg: '#eaf3ec',
  },
  helvetica: {
    id: 'helvetica', label: 'Helvetica', sub: 'Helvetica LT Pro · charcoal',
    font: "'Helvetica LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif",
    mono: "'Helvetica LT Pro','Helvetica Neue',Helvetica,Arial,sans-serif",
    acc: '#1f2937', accSoft: '#eef0f2', theadFg: '#f3f5f7',
  },
  classic: {
    id: 'classic', label: 'Classic', sub: 'Georgia serif · burgundy',
    font: "Georgia,'Times New Roman',serif", mono: "'JetBrains Mono',monospace",
    acc: '#7c1825', accSoft: '#f6edef', theadFg: '#f4e7ea',
  },
};
