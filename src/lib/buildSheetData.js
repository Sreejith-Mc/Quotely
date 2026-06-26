import { calcItem, money, grandTotalWords } from './calc.js';
import { TEMPLATES } from '../components/templates.js';

// Builds the single `data` object the QuoteSheet component renders from — shared by
// the inline live preview, the PDF overlay, and print so they can never drift apart.
export function buildSheetData({ company, cust, items, tax, manualGst, showAmount, terms, templateId, quoteNo, date, salesStaff }) {
  const cgstLabel = `CGST (${tax.cgst}%)`;
  const sgstLabel = `SGST (${tax.sgst}%)`;
  // Numeric columns are sized to their content (auto) so large amounts never overlap;
  // the item-name column (minmax) absorbs the remaining width and shrinks if needed.
  const gridCols = showAmount
    ? '22px minmax(70px,1fr) auto auto auto auto auto'
    : '22px minmax(90px,1fr) auto auto auto auto';
  const tpl = TEMPLATES[templateId] || TEMPLATES.emerald;

  let subBase = 0, cgstT = 0, sgstT = 0, grand = 0;
  const rowsOut = items.map((it, i) => {
    const c = calcItem(it, tax, manualGst);
    subBase += c.base; cgstT += c.cgst; sgstT += c.sgst; grand += c.total;
    return { idx: i + 1, name: it.name || 'Item', qty: it.qty, rate: money(c.rate), cgst: money(c.cgst), sgst: money(c.sgst), total: money(c.total) };
  });

  return {
    company: {
      logoSrc: company.logo_url, name: company.name, address: company.address, sealName: company.seal_name,
      phone: company.phone, email: company.email, website: company.website, gst: company.gst,
      hasPhone: !!company.phone, hasEmail: !!company.email, hasWebsite: !!company.website, hasGst: !!company.gst,
    },
    quoteNo, date, salesStaff,
    customer: {
      name: cust.name || '—', company: cust.company, address: cust.address, phone: cust.phone, email: cust.email,
      hasCompany: !!cust.company, hasPhone: !!cust.phone, hasEmail: !!cust.email,
    },
    items: rowsOut,
    hasItems: rowsOut.length > 0, noItems: rowsOut.length === 0,
    showAmount, gridCols, tpl, cgstLabel, sgstLabel,
    subtotal: money(subBase), cgstTotal: money(cgstT), sgstTotal: money(sgstT), grandTotal: money(grand),
    grandWords: grandTotalWords(grand),
    terms: terms.split('\n').filter((x) => x.trim()).map((t) => ({ text: t })),
    _totals: { subBase, cgstT, sgstT, grand },
  };
}
