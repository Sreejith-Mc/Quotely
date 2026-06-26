// Shared A4 quotation sheet. The SAME component drives the inline live preview, the
// PDF overlay, and print — guaranteeing zero visual difference between them, fed a
// single precomputed `data` object (see buildSheetData in pages/CreateQuotation.jsx).

export default function QuoteSheet({ data, printMode }) {
  const tpl = data.tpl;
  return (
    <div
      style={{
        // Screen preview uses px (so the fit-to-view scaler can measure it); the
        // print copy uses physical mm so it always fills an exact A4 page regardless
        // of the OS display scaling / printer DPI.
        width: printMode ? '210mm' : 794,
        // 296mm (just under A4's 297mm) avoids a sub-pixel overflow that would add a
        // blank second page when rasterised to PDF; still fills the page visually.
        minHeight: printMode ? '296mm' : 1123,
        background: '#ffffff', color: '#16201b',
        fontFamily: tpl.font, padding: '52px 52px 40px', boxSizing: 'border-box',
        position: 'relative', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Letterhead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.company.logoSrc && (
            <img src={data.company.logoSrc} alt="logo" style={{ height: 48, width: 'auto', objectFit: 'contain', alignSelf: 'flex-start' }} />
          )}
          <div style={{ fontSize: 11, lineHeight: 1.6, color: '#4a564e', maxWidth: 300, whiteSpace: 'pre-line' }}>{data.company.address}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: '#4a564e' }}>
            {data.company.hasPhone && <div><span style={{ color: '#9aa39c' }}>T&nbsp;&nbsp;</span>{data.company.phone}</div>}
            {data.company.hasEmail && <div><span style={{ color: '#9aa39c' }}>E&nbsp;&nbsp;</span>{data.company.email}</div>}
            {data.company.hasWebsite && <div><span style={{ color: '#9aa39c' }}>W&nbsp;</span>{data.company.website}</div>}
            {data.company.hasGst && <div><span style={{ color: '#9aa39c' }}>GSTIN&nbsp;</span>{data.company.gst}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: tpl.acc, lineHeight: 1 }}>QUOTATION</div>
          <div style={{ marginTop: 18, display: 'inline-grid', gridTemplateColumns: 'auto auto', gap: '6px 14px', fontSize: 11, textAlign: 'left' }}>
            <div style={{ color: '#9aa39c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No.</div>
            <div style={{ fontFamily: tpl.mono, fontWeight: 600, color: '#16201b' }}>{data.quoteNo}</div>
            <div style={{ color: '#9aa39c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</div>
            <div style={{ fontFamily: tpl.mono, color: '#16201b' }}>{data.date}</div>
            <div style={{ color: '#9aa39c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Staff</div>
            <div style={{ fontWeight: 600, color: '#16201b' }}>{data.salesStaff}</div>
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: tpl.acc, margin: '22px 0 0', borderRadius: 2 }} />

      {/* Bill To */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: tpl.acc, fontWeight: 700, marginBottom: 7 }}>Quotation For</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#16201b' }}>{data.customer.name}</div>
        {data.customer.hasCompany && <div style={{ fontSize: 12, color: '#4a564e', marginTop: 1 }}>{data.customer.company}</div>}
        <div style={{ fontSize: 11, color: '#6b766e', marginTop: 5, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{data.customer.address}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 11, color: '#6b766e', marginTop: 5 }}>
          {data.customer.hasPhone && <div>{data.customer.phone}</div>}
          {data.customer.hasEmail && <div>{data.customer.email}</div>}
        </div>
      </div>

      {/* Items table */}
      <div style={{ marginTop: 26, border: '1px solid #e7ebe7', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: data.gridCols, columnGap: 24, background: tpl.acc, padding: '12px 20px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: tpl.theadFg }}>
          <div>#</div>
          <div style={{ minWidth: 0 }}>Item</div>
          <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Qty</div>
          {data.showRate && <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Rate</div>}
          {data.showRate && <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{data.cgstLabel}</div>}
          {data.showRate && <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{data.sgstLabel}</div>}
          {data.showAmount && <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Amount</div>}
        </div>

        {data.hasItems ? (
          <div>
            {data.items.map((item) => (
              <div key={item.idx} style={{ display: 'grid', gridTemplateColumns: data.gridCols, columnGap: 24, padding: '14px 20px', fontSize: 11.5, alignItems: 'start', borderTop: '1px solid #eef1ee' }}>
                <div style={{ color: '#9aa39c', fontFamily: tpl.mono, fontSize: 11 }}>{item.idx}</div>
                <div style={{ fontWeight: 600, color: '#16201b', minWidth: 0, overflowWrap: 'anywhere' }}>{item.name}</div>
                <div style={{ textAlign: 'center', fontFamily: tpl.mono, color: '#4a564e', whiteSpace: 'nowrap' }}>{item.qty}</div>
                {data.showRate && <div style={{ textAlign: 'right', fontFamily: tpl.mono, color: '#4a564e', whiteSpace: 'nowrap' }}>{item.rate}</div>}
                {data.showRate && <div style={{ textAlign: 'right', fontFamily: tpl.mono, color: '#4a564e', whiteSpace: 'nowrap' }}>{item.cgst}</div>}
                {data.showRate && <div style={{ textAlign: 'right', fontFamily: tpl.mono, color: '#4a564e', whiteSpace: 'nowrap' }}>{item.sgst}</div>}
                {data.showAmount && <div style={{ textAlign: 'right', fontFamily: tpl.mono, fontWeight: 600, color: '#16201b', whiteSpace: 'nowrap' }}>{item.total}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '34px 14px', textAlign: 'center', fontSize: 12, color: '#b7bfb8', borderTop: '1px solid #eef1ee' }}>No items added yet</div>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
        <div style={{ width: 320 }}>
          {data.showBreakdown && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', color: '#4a564e' }}>
                <span>Subtotal</span><span style={{ fontFamily: tpl.mono }}>{data.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', color: '#4a564e', borderTop: '1px solid #eef1ee' }}>
                <span>{data.cgstLabel}</span><span style={{ fontFamily: tpl.mono }}>{data.cgstTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', color: '#4a564e', borderTop: '1px solid #eef1ee' }}>
                <span>{data.sgstLabel}</span><span style={{ fontFamily: tpl.mono }}>{data.sgstTotal}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '13px 16px', background: tpl.accSoft, borderRadius: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: tpl.acc }}>Grand Total</span>
            <span style={{ fontFamily: tpl.mono, fontSize: 17, fontWeight: 700, color: tpl.acc }}>{data.grandTotal}</span>
          </div>
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9aa39c', fontWeight: 700, marginBottom: 3 }}>Amount in words</div>
            <div style={{ fontSize: 11, color: '#16201b', lineHeight: 1.5, fontStyle: 'italic' }}>{data.grandWords}</div>
          </div>
        </div>
      </div>

      {/* Terms + seal — margin-top:auto pins this block to the bottom of the A4 sheet
          (reliable in both screen and print, unlike flex-grow). */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 30, marginTop: 'auto', paddingTop: 40, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, maxWidth: 380 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: tpl.acc, fontWeight: 700, marginBottom: 8 }}>Terms &amp; Conditions</div>
          <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {data.terms.map((t, i) => (
              <li key={i} style={{ fontSize: 11, color: '#6b766e', lineHeight: 1.5 }}>{t.text}</li>
            ))}
          </ol>
        </div>
        <div style={{ width: 150, height: 150, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(124,24,37,0.55)', borderRadius: '50%', transform: 'rotate(-9deg)' }} />
          <div style={{ position: 'absolute', inset: 9, border: '1px solid rgba(124,24,37,0.35)', borderRadius: '50%', transform: 'rotate(-9deg)' }} />
          <div style={{ textAlign: 'center', transform: 'rotate(-9deg)', color: 'rgba(124,24,37,0.7)' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.16em', fontWeight: 700 }}>★ AUTHORISED ★</div>
            <div style={{ fontSize: 14, fontWeight: 800, margin: '5px 0', letterSpacing: '0.04em' }}>{data.company.sealName}</div>
            <div style={{ fontSize: 8, letterSpacing: '0.18em', fontWeight: 600 }}>SINCE 1994</div>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', marginTop: 4, color: 'rgba(124,24,37,0.5)' }}>SIGNATORY</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26, paddingTop: 14, borderTop: '1px solid #eef1ee', textAlign: 'center', fontSize: 10, color: '#9aa39c', letterSpacing: '0.02em' }}>
        This is an electronically generated document. No signature is required.
      </div>
    </div>
  );
}
