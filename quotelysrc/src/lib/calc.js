// GST math, currency formatting, and Indian number-to-words — ported 1:1 from the
// Quotely.dc.html prototype so the live preview, summary, and exported PDF always agree.

export function calcItem(item, tax, manualGst) {
  const qty = Math.max(1, parseFloat(item.qty) || 0) || 1;
  if (manualGst) {
    const rate = parseFloat(item.rate) || 0;
    const cgst = parseFloat(item.cgst) || 0;
    const sgst = parseFloat(item.sgst) || 0;
    const base = rate * qty;
    const total = base + cgst + sgst;
    return { base, rate, cgst, sgst, total };
  }
  const total = parseFloat(item.total) || 0;
  const tpc = (parseFloat(tax.cgst) || 0) + (parseFloat(tax.sgst) || 0);
  const base = total / (1 + tpc / 100);
  const cgst = (base * (parseFloat(tax.cgst) || 0)) / 100;
  const sgst = (base * (parseFloat(tax.sgst) || 0)) / 100;
  const rate = base / qty;
  return { base, rate, cgst, sgst, total };
}

export function money(n) {
  if (!isFinite(n)) n = 0;
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function numberToWords(n) {
  n = Math.floor(Math.abs(n));
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
  const three = (x) => {
    const h = Math.floor(x / 100);
    const r = x % 100;
    return (h ? a[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : '');
  };
  if (n === 0) return 'Zero';
  let s = '';
  const cr = Math.floor(n / 10000000);
  n %= 10000000;
  const la = Math.floor(n / 100000);
  n %= 100000;
  const th = Math.floor(n / 1000);
  n %= 1000;
  if (cr) s += three(cr) + ' Crore ';
  if (la) s += three(la) + ' Lakh ';
  if (th) s += three(th) + ' Thousand ';
  if (n) s += three(n);
  return s.trim();
}

export function grandTotalWords(grand) {
  return 'Rupees ' + numberToWords(grand) + ' Only';
}

export function formatQuoteNumber(prefix, next, pad) {
  return prefix + String(parseInt(next, 10) || 0).padStart(pad, '0');
}

export function todayStr() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function genTempPassword() {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let p = '';
  for (let i = 0; i < 8; i++) p += c[Math.floor(Math.random() * c.length)];
  return 'LT-' + p;
}

export function initialsOf(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
