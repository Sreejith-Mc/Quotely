import { calcItem, money, grandTotalWords } from './calc.js';
import { buildTpl } from '../components/templates.js';

// Builds the single `data` object the QuoteSheet component renders from — shared by
// the inline live preview, the PDF overlay, and print so they can never drift apart.
export function buildSheetData({ company, cust, items, tax, manualGst, showAmount, showRate, showWarranty, terms, templateId, accent, quoteNo, date, salesStaff, salesStaffPhone, showProfit, margin, roundOff, showRoundOff }) {
  const cgstLabel = `CGST (${tax.cgst}%)`;
  const sgstLabel = `SGST (${tax.sgst}%)`;
  // "Show rate" off → a minimal quote: only #, Item, Qty in the table and only the
  // Grand Total in the summary. "Show amount" only applies when rates are shown.
  // "Show warranty" is independent — it shows even when rate is off.
  const showRateCols = showRate !== false;
  const showAmountCol = showRateCols && showAmount;
  const showWarrantyCol = !!showWarranty;
  // Numeric columns are sized to their content (auto) so large amounts never overlap;
  // the item-name column (minmax) absorbs the remaining width and shrinks if needed.
  const cols = ['22px', 'minmax(90px,1fr)', 'auto']; // #, item, qty
  if (showWarrantyCol) cols.push('auto'); // warranty
  if (showRateCols) cols.push('auto', 'auto', 'auto'); // rate, cgst, sgst
  if (showAmountCol) cols.push('auto'); // amount
  const gridCols = cols.join(' ');
  const tpl = buildTpl(templateId, accent);

  let subBase = 0, cgstT = 0, sgstT = 0, grand = 0;
  const rowsOut = items.map((it, i) => {
    const c = calcItem(it, tax, manualGst);
    subBase += c.base; cgstT += c.cgst; sgstT += c.sgst; grand += c.total;
    return { idx: i + 1, name: it.name || 'Item', qty: it.qty, warranty: it.warranty || '—', rate: money(c.rate), cgst: money(c.cgst), sgst: money(c.sgst), total: money(c.total) };
  });

  // Round-off is a flat adjustment to the grand total (e.g. +2 turns 998 → 1000, or a
  // negative value rounds down). Always applied when non-zero; the checkbox only decides
  // whether the round-off line is *shown* on the quote.
  const roundOffVal = Number(roundOff) || 0;
  const grandFinal = grand + roundOffVal;
  const roundLabel = (roundOffVal >= 0 ? '+ ' : '− ') + money(Math.abs(roundOffVal));

  // Profit = the margin % applied to the pre-GST subtotal. Only ever rendered on the
  // admin export (showProfit), never on the normal download/print.
  const marginPct = Number(margin) || 0;
  const profitVal = subBase * marginPct / 100;

  return {
    company: {
      logoSrc: company.logo_url, name: company.name, address: company.address, sealName: company.seal_name, sealUrl: company.seal_url,
      phone: company.phone, email: company.email, website: company.website, gst: company.gst,
      hasPhone: !!company.phone, hasEmail: !!company.email, hasWebsite: !!company.website, hasGst: !!company.gst,
    },
    quoteNo, date, salesStaff, salesStaffPhone: salesStaffPhone || '',
    customer: {
      name: cust.name || '—', company: cust.company, address: cust.address, phone: cust.phone, email: cust.email,
      hasCompany: !!cust.company, hasPhone: !!cust.phone, hasEmail: !!cust.email,
    },
    items: rowsOut,
    hasItems: rowsOut.length > 0, noItems: rowsOut.length === 0,
    showAmount: showAmountCol, showRate: showRateCols, showWarranty: showWarrantyCol, showBreakdown: showRateCols,
    gridCols, tpl, cgstLabel, sgstLabel,
    subtotal: money(subBase), cgstTotal: money(cgstT), sgstTotal: money(sgstT), grandTotal: money(grandFinal),
    grandWords: grandTotalWords(grandFinal),
    showRoundOff: !!showRoundOff && roundOffVal !== 0, roundOff: roundLabel,
    showProfit: !!showProfit, marginPercent: marginPct, profit: money(profitVal),
    terms: terms.split('\n').filter((x) => x.trim()).map((t) => ({ text: t })),
    _totals: { subBase, cgstT, sgstT, grand: grandFinal, roundOff: roundOffVal, profit: profitVal },
  };
}
