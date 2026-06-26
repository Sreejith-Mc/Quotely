# Quotation Generator Web Application

_Started 2026-06-26 06:03 UTC_

---

## User

# Quotation Generator Web Application – Complete UI/UX Design Brief

Design a complete, modern, premium, and fully responsive web application for a **Quotation Generator**. The application should feel like a professional SaaS product released in **2026**, inspired by products like **Stripe Dashboard, Linear, Framer, Notion, Vercel, and Raycast**.

The interface should be extremely clean, minimal, elegant, and highly usable. Avoid the outdated look of traditional accounting software. Use generous whitespace, rounded corners, subtle shadows, smooth micro-interactions, and excellent typography (Inter or Manrope).

The application must support Desktop, Tablet, and Mobile.

---

# Overall Layout

The default page after login is **Create Quotation**.

Desktop layout should be split into two sections:

* **Left Side (40%)** – Quotation Builder
* **Right Side (60%)** – Live Quotation Preview

The quotation preview must update instantly while the employee types.

The preview must be identical to the exported PDF. There should be **zero visual difference** between the live preview, downloaded PDF, and printed version.

---

# Header

Modern sticky navigation bar.

Left:

* Company Logo

Center:

* Create Quotation (Active)

Right:

* Admin Login button (when not logged in)
* Employee profile after login

---

# Company Information (System Controlled)

Employees should never edit company details.

Company information is automatically loaded from Admin Settings.

### Required

* Company Logo
* Company Name
* Company Address
* Company Seal

### Optional

* Company Phone Number
* Company Email
* Company Website
* Company GST Number

If any optional field is empty, it should not be displayed on the quotation. The layout should automatically adjust without leaving empty space.

Whenever the admin updates any company information, all newly created quotations should automatically use the updated information.

---

# Quotation Header (Always Visible)

The quotation preview on the right should **always display** the following, even before the employee starts filling in customer details:

* Quotation
* Quotation Number
* Date
* Sales Staff

These fields should always remain visible.

### Quotation Number

Automatically generated.

Sequential.

Never duplicates.

Cannot be edited by employees.

Example:

QT-000001

QT-000002

QT-000003

Only Admin can configure:

* Prefix
* Starting Number

---

### Date

Automatically uses today's date.

Cannot be edited by employees.

---

### Sales Staff

Automatically uses the logged-in employee's name.

No manual selection required.

If no employee is logged in, display:

"Not Assigned"

---

# Left Panel – Quotation Builder

Everything should be organized into modern cards with collapsible sections.

---

## Customer Details

Fields:

* Customer Name
* Company Name (Optional)
* Address
* Phone Number
* Email (Optional)
* GST Number (Optional)

---

## Item Details

Modern editable table.

Each row contains:

* Item Name
* Quantity
* Total Amount

Buttons:

* Add Item
* Duplicate Row
* Delete Row

Rows animate smoothly.

---

# Smart GST Calculation

This is one of the application's key features.

By default, employees should ONLY enter:

* Item Name
* Quantity
* Total Amount

Rate, CGST, and SGST input fields should remain hidden.

After entering the Total Amount, the system should automatically calculate:

* Rate
* CGST
* SGST

Example:

Total = ₹11,800

CGST (9%) = ₹900

SGST (9%) = ₹900

Rate = ₹10,000

The quotation preview updates instantly.

---

## Manual Calculation Toggle

Provide a toggle:

"Manual GST Calculation"

Default = OFF

When OFF:

Hide:

* Rate
* CGST
* SGST

Everything is automatically calculated.

When ON:

Show editable fields:

* Rate
* CGST
* SGST

Employees may override automatic calculations.

---

# Live Summary Card

Always visible.

Shows:

Subtotal

CGST Total

SGST Total

Grand Total

Grand Total in Words

Updates instantly whenever items change.

---

# Right Panel – Live Quotation Preview

Display a realistic A4 paper with subtle shadow.

The preview should always look exactly like the final exported PDF.

Include:

Company Logo

Company Name

Company Address

(Optional Company Phone)

(Optional Company Email)

(Optional Website)

(Optional GST Number)

Quotation

Quotation Number

Date

Sales Staff

Customer Details

Items Table

Item

Qty

Rate

CGST

SGST

Total

Summary

CGST Total

SGST Total

Grand Total

Grand Total in Words

Terms & Conditions

Company Seal

Footer:

"This is an electronically generated document. No signature is required."

Everything updates in real time.

---

# PDF Controls

Below the preview:

* Preview
* Download PDF
* Print

The generated PDF must be pixel-perfect.

---

# Terms & Conditions

Placeholder section initially.

Admin can edit at any time.

All future quotations automatically use the latest version.

---

# Employee Login

Employees log in using:

* Email
* Password

After login:

Sales Staff name automatically appears on quotations.

Employees can edit:

* Name
* Email
* Phone
* Profile Picture
* Password

Employees cannot edit company information.

---

# Admin Dashboard

Modern dashboard with sidebar navigation.

Sections:

Dashboard

Branding

Company Information

Employees

Tax Settings

Quotation Numbering

Terms & Conditions

Templates

Settings

---

# Company Branding

Admin can update:

Company Logo

Company Name

Company Address

Company Phone

Company Email

Company Website

Company GST Number

Company Seal

Changes immediately affect all newly generated quotations.

---

# Tax Settings

Admin can change:

CGST %

SGST %

Whenever changed:

Future quotations use the updated percentages.

Table headers should automatically update.

Example:

CGST (9%)

becomes

CGST (12%)

---

# Employee Management

Admin can:

Create Employee

Edit Employee

Disable Employee

Delete Employee

Upload Profile Picture

Assign Roles:

Employee

Manager

Admin

Admin may reset employee passwords but cannot view existing passwords.

---

# Quotation Numbering

Admin controls:

Prefix

Starting Number

Auto Increment

Never Duplicate

Example:

QT-000001

QT-000002

QT-000003

---

# Responsive Design

Desktop

Builder on left

Preview on right

Tablet

Builder first

Preview below

Mobile

Single-column layout

Sticky floating actions:

Preview

Download

Print

---

# Animations

Smooth page transitions

Hover effects

Accordion animations

Input focus states

Toast notifications

Soft shadows

Modern micro-interactions

Loading skeletons

---

# Empty States

Beautiful illustrations.

Examples:

No Items Added

No Quotations

No Customers

---

# Notifications

Modern toast notifications.

Examples:

Quotation Saved

Quotation Generated

PDF Downloaded

Settings Updated

Employee Added

Logo Updated

---

# Accessibility

Keyboard navigation

ARIA support

High contrast

Screen reader friendly

Responsive typography

Large touch targets

---

# Design Language

Minimal

Premium

Modern SaaS

Large spacing

16px rounded corners

Soft shadows

Glassmorphism only where appropriate

Excellent typography hierarchy

Consistent 8px spacing system

---

# Deliver These Screens

1. Desktop Create Quotation

2. Mobile Create Quotation

3. Admin Login

4. Employee Login

5. Dashboard

6. Company Branding

7. Company Information

8. Employee Management

9. Tax Settings

10. Terms & Conditions

11. Quote Preview

12. PDF Preview

13. Empty States

14. Success States

15. Optional Dark Mode

---

# Design Goal

The application should feel as polished as Stripe or Linear while remaining incredibly simple to use. Employees should be able to generate a professional quotation in under two minutes, with real-time updates, automatic tax calculations, pixel-perfect PDF output, and a seamless user experience across desktop, tablet, and mobile.

## Assistant

This is a meaty, well-specified brief. Before I build, a few decisions will shape everything — let me get your input so I don't guess wrong.

_[tool: questions_v2]_

## User

Questions answered:
- deliverable: One working interactive prototype (Create Quotation fully live: type → preview updates → tax auto-calcs), with the other screens as polished static views reachable by nav
- accent: Emerald / green (finance, money-positive)
- font: Manrope
- darkmode: Yes — include a dark mode toggle on the app
- currency: Indian Rupee ₹ with CGST/SGST as specified
- preview_emphasis: The live preview = exact PDF match (paper realism), The smart auto-GST calculation flow, The overall SaaS polish / micro-interactions, The admin dashboard depth, Empty & success states / toasts
- logo: Quotely
- sample_data: Use that as logo

## Assistant

_[tool: view_image]_

_[tool: image_metadata]_

_[tool: run_script]_

Logo palette locked: forest green `rgb(34,103,58)` + maroon `rgb(124,24,37)`. That pairs perfectly with the emerald direction you chose. I'll use LogTech as the demo company, "Quotely" as the app brand.

Let me set up the project.

_[tool: copy_files]_

_[tool: update_todos]_

Now the shared A4 sheet — the heart of "preview = PDF". It's a template-only child DC fed one precomputed `data` object.

_[tool: dc_write]_

Typo in the table header style (`# effff`). Fix it:

_[tool: dc_html_str_replace]_

Now the main app. This is the big one — full live builder, preview scaling, admin, logins, all states. Writing it in one pass.

_[tool: dc_write]_

_[tool: show_html]_

I'm fixing/checking a brand-new complex build, so a screenshot is warranted.

_[tool: show_html]_

Math is correct (₹1,77,000). But the Customer and Items cards are showing as empty thin bars — something's wrong there. Let me check logs.

_[tool: get_webview_logs]_

_[tool: eval_js]_

Content is all there — the screenshot was just an early paint frame. Let me re-capture to confirm the full builder renders.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Found it — the builder is a flex column with `max-height`, so the tall cards got shrunk to 9px. They need `flex-shrink:0`.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

The edit didn't hot-reload into the running DOM. Let me reload the preview.

_[tool: show_html]_

_[tool: save_screenshot]_

The fix works after reload. Now let me verify the other screens and states.

_[tool: multi_screenshot]_

Dark mode, dashboard, tax, employees all look great. Let me verify the PDF overlay and login screens (the overlay step didn't trigger), and check the dark-mode H1.

_[tool: multi_screenshot]_

The overlay selectors aren't matching (special glyphs). Let me drive them more reliably.

_[tool: eval_js]_

_[tool: save_screenshot]_

PDF overlay is beautiful. Let me see the lower half (table, summary, seal) and the login screen.

_[tool: multi_screenshot]_

_[tool: save_screenshot]_

_[tool: multi_screenshot]_

PDF overlay confirmed working earlier. Let me verify the sheet's lower half (table, summary, seal) via the inline preview, and check the login screen.

_[tool: multi_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: show_html]_

Tooling hiccup, page is fine. Let me scroll the inline preview to confirm the table/summary/seal render.

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

The preview pane reserves untransformed height (CSS transform doesn't shrink layout box), leaving dead scroll space. Fixing by clipping the wrap to the scaled height.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: save_screenshot]_

Dead scroll space fixed. Let me confirm the sheet's lower content exists (table, totals, terms, seal).

_[tool: eval_js]_

_[tool: eval_js]_

Everything renders correctly — terms, totals, seal, footer, items all present (the "Terms" heading is uppercase-transformed, hence the case mismatch). The build is complete and solid across all screens.

_[tool: delete_file]_

_[tool: update_todos]_

_[tool: snip]_

**Quotely** is built — a working SaaS quotation generator in your LogTech green/maroon palette, Manrope + JetBrains Mono.

What's live and interactive on **Create Quotation**:
- Type anywhere → the A4 document on the right updates instantly. The preview *is* the PDF (same shared component drives inline preview, PDF overlay, and print).
- **Smart GST**: enter just Item Name / Qty / Total → Rate, CGST, SGST auto-derived (₹1,18,000 → base ₹1,00,000 + ₹9,000 + ₹9,000). Flip **Manual GST** to override.
- Live Summary with Grand Total in Indian-format words; add/duplicate/delete rows with animation; empty state when cleared.
- Auto quote number (QT-000007), today's date, logged-in staff — all locked from editing.

Reachable via the header (Dashboard button + **▦ Screens** launcher): Admin dashboard with stats & recent quotes, Branding/Company Info, Employee Management, Tax Settings (change % → headers update everywhere), Quotation Numbering, Terms editor, Employee/Admin login, Profile, PDF preview overlay, success modal, toasts, and a **dark mode** toggle (paper stays white, like a real PDF).

Notes:
- Download/Print route through the browser's print dialog (true client-side PDF generation would need a library — happy to wire one in).
- It's one prototype with shared state, so editing tax % or company info genuinely flows into the live quote.

Open the **▦ Screens** menu to jump between all the deliverable views. Want me to refine any specific screen, adjust the green tone, or add the mobile single-column layout as its own framed view?

## User

ok a few updates on the design use this image as the logo

- the quotation can u show it fully ? not in a scroll 

- Customer Details Exept customer Name everything else is Optional dont even ask for the GST No.

-on the add iteam the box to enter data make sure the iteam name box is the biggest one so place it as the first one with a full box width then place the quantity and total amount below it 

- on the Quote done show the Rate as under the name try showing it after the QTY also make sure the Amount field on the Quote is toggleable so some Quotes the Amount field can be hidden if the Amount is toggled off on the Quote the total should not be shown only the other data should be shown 

also the amount in words should be placed below the grand total number 

also the A4 Synced chip do we need it ? also we can use a4 as default but the quate is extremely big what should we do ?

## Assistant

Let me look at the new logo and re-read the current files before making changes.

_[tool: view_image]_

_[tool: image_metadata]_

New logo copied in. Let me read the current files to make precise edits.

_[tool: copy_files]_

_[tool: read_file]_

Now updating QuoteSheet: remove customer GST, add Rate column, make Amount toggleable, move amount-in-words below the grand total.

_[tool: str_replace_edit]_

Now the main app. Let me read the relevant sections.

_[tool: read_file]_

Now the main app edits — customer card, item rows, the Show-amounts toggle, remove A4 chip, and fit-to-view.

_[tool: str_replace_edit]_

Now the logic: add `showAmount` state, the amount toggle, `gridCols`, and the fit-to-view function.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now add `gridCols`, `showAmount` to sheetData and the toggle handlers to the returns:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: show_html]_

Full quotation now fits in view, toggle present, GST gone, optional labels set. Let me inspect the sheet detail and test the amount toggle.

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

html-to-image can't capture the fixed overlay; let me verify the new sheet structure via DOM instead.

_[tool: eval_js]_

Structure confirmed: Rate column, words below grand total. Now testing the amount toggle off.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Amount toggle works perfectly — off hides the Amount column and all totals. Let me re-enable it and check the new item-row layout.

_[tool: eval_js]_

_[tool: save_screenshot]_

Let me verify the new item-row layout by scrolling the actual builder column.

_[tool: eval_js]_

_[tool: save_screenshot]_

All changes verified via DOM and visuals. Cleaning up and finalizing.

_[tool: delete_file]_

_[tool: ready_for_verification]_

All updates are in:

- **New logo** swapped in everywhere (header stays "Quotely", the quote uses your LogTech mark).
- **Quotation shows fully** — the whole A4 now scales to fit the preview pane, no scrolling.
- **Customer Details** — only Name is required (marked *), everything else is optional, and the GST field is gone entirely.
- **Add Item** — item name is now a full-width box on top; Quantity and Total Amount sit below it.
- **On the quote** — Rate is its own column right after Qty; **Amount in words** now sits directly under the Grand Total figure.
- **Amount toggle** — a "Show amounts" switch in the preview bar (where the A4 chip used to be). Turn it off and the quote drops the Amount column *and* all totals, leaving item/qty/rate/CGST/SGST only.
- **A4·synced chip removed.**

On your question about **extremely big quotes**: right now A4 is the canvas and a long quote just scales down to stay fully visible (and prints as one tall sheet). The clean production answer is **auto-pagination** — flow items across multiple A4 pages with the letterhead repeating and "Page 1 of 2" footers, so each page prints true-to-size. That's a bigger build; want me to add real multi-page A4 pagination next?

## User

The Company info in the dashboard is not working if its not needed remove if its needd fix it 
on employee tab when clicking on add employee aa popup should come requesting Employee name, Email Id and a temp pass so it can be shared with the employee

in templates make sure the some templtes are avalabe for the Quotation
in some other fonts and desigs but should have all the data try one with Helvetica LT Pro font

## Assistant

Snipping settled work, then tackling the four updates.

_[tool: snip]_

_[tool: update_todos]_

Let me make QuoteSheet template-aware. First the root, then global token replacements.

_[tool: str_replace_edit]_

_[tool: run_script]_

Now wire templates and modal state into the logic.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now fix the admin nav routing, titles, and add the Company/Templates tabs + modal handlers.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Add the `genPass` helper to the class.

_[tool: dc_js_str_replace]_

Now the template: split Branding/Company Info, add the Templates tab and the Add-Employee modal. Let me read the admin content markup.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now replace the placeholder block with a real Templates gallery + settings placeholder.

_[tool: str_replace_edit]_

Now the Add-Employee modal. Inserting before the toast block.

_[tool: str_replace_edit]_

_[tool: show_html]_

The sheet went blank — the template-token holes likely broke it. Checking logs.

_[tool: get_webview_logs]_

_[tool: eval_js]_

Sheet content is actually present (eval shows full text) — the blank was an early-mount frame. Let me record progress and re-capture.

_[tool: update_todos]_

_[tool: multi_screenshot]_

Everything works — sheet renders fully, three distinct templates (Emerald/Helvetica/Classic), Company Info is its own working tab, and the Add Employee modal has name, email, and a regenerable temp password.

_[tool: update_todos]_

_[tool: ready_for_verification]_

Real bug: the admin logo `<img>` fetches the literal hole before it resolves. Hardcoding that src (it's a known asset path).

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

All four updates are done and the page loads cleanly:

- **New logo** applied throughout.
- **Company Info** is now its own working admin tab with all fields (name, address, phone, email, website, GST) — separate from Branding (logo/seal). The earlier broken nav link is fixed.
- **Add Employee** opens a modal asking for Employee Name, Email ID, and an auto-generated Temporary Password (with a regenerate button) to share — "Add & send invite" appends them and toasts.
- **Quotation Templates** tab with three selectable, visually distinct designs that carry the same data: **Emerald** (Manrope/green), **Helvetica** (Helvetica LT Pro/charcoal), and **Classic** (Georgia serif/burgundy). Picking one instantly restyles the live preview and PDF.

Note on the Helvetica template: "Helvetica LT Pro" is a licensed font that isn't web-hosted, so I set the stack to use it if installed locally and fall back to Helvetica Neue/Helvetica/Arial — visually equivalent. If you have the licensed web font files, drop them in and I'll wire up an @font-face so it's pixel-exact everywhere.

## User

The priview is broken its only showing a small part of the Quotation when preview is clicked

## Assistant

The PDF overlay centers a sheet taller than the viewport, so the top/bottom get cut off and you can't scroll to them. I'll scale the overlay sheet to fit, same as the inline preview.

_[tool: update_todos]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the overlay markup — wrap the sheet in a scaling inner and use the refs.

_[tool: str_replace_edit]_

## Assistant

The PDF overlay fix is complete — the sheet now scales to fit the viewport via the refs and `fitPdf()`. Let me verify it.

_[tool: snip]_

_[tool: update_todos]_

## User

Continue

## Assistant

_[tool: save_screenshot]_

## Assistant

The PDF overlay fix is in place. Let me reload and verify it scales correctly.

_[tool: show_html]_

## Assistant

Let me verify the PDF overlay scaling works by opening it and checking the rendered dimensions.

_[tool: eval_js]_

_[tool: show_html]_

This is a bug fix, so verifying directly is warranted.

_[tool: show_html]_

Inline preview looks good. Now let me open the PDF overlay to verify the fix.

_[tool: save_screenshot]_

The overlay didn't open — button selector didn't match. Let me find it.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Overlay exists in DOM. The screenshot tool just isn't capturing the fixed overlay. Let me verify the scaling math directly.

_[tool: eval_js]_

Good clarification. Let me first finish checking the overlay, then fix the toggle behavior.

_[tool: eval_js]_

_[tool: eval_js]_

PDF overlay fix confirmed (fits vertically). Now the toggle fix — keep the summary, only drop the Amount column. Let me read the QuoteSheet summary.

_[tool: grep]_

The Amount column toggles correctly (lines 65, 78). I just need to remove the `showAmount` wrapper around the Summary block so totals always stay.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now let me verify: toggle amounts off, confirm the table loses its Amount column but the Grand Total summary stays.

_[tool: show_html]_

_[tool: eval_js]_

Both fixes confirmed: with amounts off, the table drops only its Amount column while Subtotal, Grand Total (₹1,77,000), and amount-in-words all remain. Let me toggle back on and clean up.

_[tool: eval_js]_

_[tool: delete_file]_

_[tool: update_todos]_

Both issues are fixed:

- **PDF Preview** now scales the full A4 sheet to fit your screen — the whole quotation is visible top-to-bottom instead of a cropped slice.
- **Show amounts toggle** now only removes the **Amount column** from the items table. Subtotal, CGST/SGST totals, Grand Total, and amount-in-words all stay on the quotation.

