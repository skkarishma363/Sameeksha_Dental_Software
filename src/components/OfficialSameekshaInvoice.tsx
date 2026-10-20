"use client";

import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";

export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface OfficialSameekshaInvoiceProps {
  patient?: {
    id?: string | number;
    patient_id?: string | number;
    op_no?: string | number;
    opNumber?: string | number;
    name?: string;
    firstName?: string;
    lastName?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    visit?: string;
    firstVisit?: string;
    [key: string]: any;
  } | null;
  invoice?: {
    id?: string;
    invoice_id?: string;
    invoiceNo?: string;
    patientId?: string;
    patientName?: string;
    doctor?: string;
    treatment?: string;
    items?: InvoiceLineItem[];
    subtotal?: number;
    discount?: number;
    discountType?: "percentage" | "fixed";
    discountValue?: number;
    tax?: number;
    total?: number;
    paidAmount?: number;
    status?: string;
    date?: string;
    invoice_date?: string;
    paymentDate?: string;
    created_at?: string;
    paymentLogs?: { method: string; amount: number; date: string }[];
    [key: string]: any;
  } | null;
  dateStr?: string;
  className?: string;
}

import { formatInvoiceDate } from "@/lib/date-utils";
export { formatInvoiceDate };

/**
 * Formats a numeric currency value into the standard Indian Rupee notation
 * matching the Sameeksha official reference format (e.g. "Rs. 1,000.00", "Rs. 66,133.00").
 */
export function formatInvoiceCurrency(amount: number): string {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Cleanly wraps text into lines fitting within a max character limit
 * while keeping whole words intact.
 */
export function wrapInvoiceText(text: string, maxChars = 52): string[] {
  const clean = (text || "").trim();
  if (!clean || clean.length <= maxChars) return [clean || ""];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + (current ? " " : "") + w).length <= maxChars) {
      current = current + (current ? " " : "") + w;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface InvoiceRenderRow {
  isSubItem: boolean;
  prefix: string;
  descriptionLines: string[];
  amountStr: string;
  y: number;
}

export interface InvoiceLayoutResult {
  rows: InvoiceRenderRow[];
  dividerY: number;
  subtotalY: number;
  discountY: number;
  totalY: number;
  paidY: number;
  balanceY: number;
  hasDiscount: boolean;
  hasPayment: boolean;
  isOverflow: boolean;
  lineHeight: number;
}

/**
 * Computes vertically arranged treatment rows, alignment coordinates,
 * text wrapping, horizontal divider position, and prominent total matching
 * the authentic Sameeksha reference invoice format.
 */
export function computeInvoiceLayout(
  items: InvoiceLineItem[],
  subtotal: number,
  discountAmt: number,
  total: number,
  paidAmount: number,
  balanceDue: number,
  startY = 575
): InvoiceLayoutResult {
  // Comfortable vertical spacing based on line count for 24px font
  let lineHeight = 48;
  if (items.length > 8) lineHeight = 38;
  else if (items.length > 5) lineHeight = 42;

  let currentY = startY;
  let mainIndex = 1;
  const rows: InvoiceRenderRow[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rawDesc = (item.description || "Treatment / Consultation").trim();

    // Check for sub-item patterns: "a. ", "b) ", "- ", "• " or flagged as subItem
    const subMatch = rawDesc.match(/^([a-z][\.\)]|[-•*])\s*(.*)/i);
    const isSub = Boolean(subMatch) || (item as any).isSubItem === true;

    let prefix = "";
    let cleanDesc = rawDesc;
    if (subMatch) {
      prefix = subMatch[1].endsWith(".") || subMatch[1].endsWith(")") ? subMatch[1] : `${subMatch[1]}.`;
      cleanDesc = subMatch[2].trim();
    } else if (isSub) {
      prefix = "-";
    } else {
      prefix = `${mainIndex}.`;
      mainIndex++;
    }

    // Display quantity in parentheses e.g. "GIC RESTORATIONS (3)" if qty > 1 and not already in description
    const qty = Number(item.quantity) || 1;
    if (qty > 1 && !/\(\s*\d+\s*\)/.test(cleanDesc) && !/\b\d+\s*x\b/i.test(cleanDesc) && !/\bx\s*\d+\b/i.test(cleanDesc)) {
      cleanDesc = `${cleanDesc} (${qty})`;
    }

    const maxChars = isSub ? 40 : 46;
    const lines = wrapInvoiceText(cleanDesc, maxChars);

    // If an item has 0 amount and is immediately followed by a sub-item, treat as section header
    const nextItem = items[i + 1];
    const nextIsSub = nextItem && (/^[a-z][\.\)]\s+/i.test(nextItem.description) || (nextItem as any).isSubItem);
    const isHeaderOnly = (item.amount === 0 || item.amount === undefined) && nextIsSub;
    const amountStr = isHeaderOnly ? "" : formatInvoiceCurrency(item.amount);

    rows.push({
      isSubItem: isSub,
      prefix,
      descriptionLines: lines,
      amountStr,
      y: currentY,
    });

    currentY += lines.length > 1 ? lineHeight + (lines.length - 1) * 29 : lineHeight;
  }

  const dividerY = currentY + 18;
  const hasDiscount = discountAmt > 0;
  const hasPayment = paidAmount > 0;

  let subtotalY = 0;
  let discountY = 0;
  let totalY = 0;
  let paidY = 0;
  let balanceY = 0;

  if (hasDiscount) {
    subtotalY = dividerY + 30;
    discountY = subtotalY + 24;
    totalY = discountY + 34;
  } else {
    totalY = dividerY + 36;
  }

  if (hasPayment) {
    paidY = totalY + 28;
    balanceY = paidY + 24;
  }

  const bottomMostY = hasPayment ? balanceY : totalY;
  const isOverflow = bottomMostY > 1315;

  return {
    rows,
    dividerY,
    subtotalY,
    discountY,
    totalY,
    paidY,
    balanceY,
    hasDiscount,
    hasPayment,
    isOverflow,
    lineHeight,
  };
}

/**
 * Official Sameeksha Super Speciality Dental Hospital Invoice Component.
 *
 * Uses the authentic Sameeksha invoice template background and overlays dynamic
 * patient info and a clean vertically arranged treatment list with right-aligned
 * amounts and a prominent Total matching the exact hospital reference layout.
 */
export const OfficialSameekshaInvoice: React.FC<OfficialSameekshaInvoiceProps> = ({
  patient,
  invoice,
  dateStr,
  className = "",
}) => {
  const assetSrc = getAssetPath("/Sameeksha Dental Hospital Invoice Template(1).png");

  // 1. Patient Name: Exact line from x = 208..514, baseline y = 415
  const fullName = (
    patient?.name ||
    `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
    invoice?.patientName ||
    ""
  ).trim();

  // 2. Age / Sex: Exact line from x = 208..514, baseline y = 460
  const ageVal = patient?.age ? `${patient.age} Yrs` : "";
  const rawGender = String(patient?.gender || "").trim();
  let genderVal = "";
  if (/^f/i.test(rawGender)) genderVal = "Female";
  else if (/^m/i.test(rawGender)) genderVal = "Male";
  else if (rawGender) genderVal = rawGender;

  let ageSexDisplay = "";
  if (ageVal && genderVal) {
    ageSexDisplay = `${ageVal} / ${genderVal}`;
  } else if (ageVal) {
    ageSexDisplay = ageVal;
  } else if (genderVal) {
    ageSexDisplay = genderVal;
  }

  // 3. Invoice No.: Exact line from x = 207..514, baseline y = 505
  const invoiceNo = String(
    invoice?.id ||
    invoice?.invoice_id ||
    invoice?.invoiceNo ||
    ""
  ).trim();

  // 4. OP No.: Exact line from x = 815..1005, baseline y = 415
  const opNo = String(
    patient?.op_no ||
    patient?.opNumber ||
    patient?.id ||
    patient?.patient_id ||
    invoice?.patientId ||
    ""
  ).trim();

  // 5. Date: Exact line from x = 815..1005, baseline y = 460
  const rawDate =
    dateStr ||
    invoice?.paymentDate ||
    invoice?.date ||
    invoice?.invoice_date ||
    invoice?.created_at ||
    patient?.visit ||
    patient?.firstVisit;
  const formattedDate = formatInvoiceDate(rawDate);

  // 6. Resolve Treatment Items & Charges
  const rawItems: any[] = Array.isArray(invoice?.items) && invoice.items.length > 0
    ? invoice.items
    : (invoice?.treatment
        ? [{
            description: invoice.treatment,
            quantity: 1,
            unitPrice: Number(invoice.total || invoice.subtotal || 0),
            amount: Number(invoice.total || invoice.subtotal || 0)
          }]
        : []);

  const items: InvoiceLineItem[] = rawItems.map((it: any) => {
    const qty = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice !== undefined ? it.unitPrice : it.unit_price) || (Number(it.amount) / qty) || 0;
    const lineTotal = Number(it.amount) || (qty * unitPrice);
    return {
      description: it.description || "Dental Procedure",
      quantity: qty,
      unitPrice,
      amount: lineTotal
    };
  });

  // 7. Calculate Financial Totals
  const calculatedSubtotal = items.reduce((sum, it) => sum + it.amount, 0);
  const subtotal = Number(invoice?.subtotal) || calculatedSubtotal || Number(invoice?.total) || 0;

  const discountVal = Number(invoice?.discountValue !== undefined ? invoice?.discountValue : invoice?.discount) || 0;
  const isFixedDiscount = invoice?.discountType === "fixed";
  const discountAmt = isFixedDiscount
    ? discountVal
    : (subtotal * (Number(invoice?.discount) || 0)) / 100;

  const taxPct = Number(invoice?.tax) || 0;
  const taxAmt = ((subtotal - discountAmt) * taxPct) / 100;

  const calculatedTotal = Math.max(0, Math.round(subtotal - discountAmt + taxAmt));
  const total = Number(invoice?.total) || calculatedTotal || subtotal;
  const paidAmount = Number(invoice?.paidAmount) || (invoice?.status === "Paid" ? total : 0);
  const balanceDue = Math.max(0, total - paidAmount);

  // 8. Compute Vertical Reference Layout
  const layout = computeInvoiceLayout(
    items,
    subtotal,
    discountAmt,
    total,
    paidAmount,
    balanceDue,
    575
  );

  return (
    <div
      className={`official-invoice-container relative bg-white select-none ${className}`}
      style={{
        width: "100%",
        maxWidth: "200mm",
        aspectRatio: "1064 / 1479",
        margin: "0 auto",
      }}
    >
      {/* 1. Authentic Template Image Background */}
      <img
        src={assetSrc}
        alt="Sameeksha Dental Hospital Invoice Template"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* 2. Mathematical Coordinate Overlay SVG */}
      <svg
        viewBox="0 0 1064 1479"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <style>{`
            .inv-field-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 700;
              font-size: 22px;
              fill: #002244;
            }
            .inv-row-num {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 700;
              font-size: 24px;
              fill: #111827;
            }
            .inv-row-desc {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 600;
              font-size: 24px;
              fill: #111827;
            }
            .inv-row-amt {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 600;
              font-size: 24px;
              fill: #111827;
            }
            .inv-total-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 800;
              font-size: 28px;
              fill: #000000;
            }
            .inv-sub-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 600;
              font-size: 19px;
              fill: #374151;
            }
          `}</style>
        </defs>

        {/* ============================================================== */}
        {/* ROW 1: Patient Name (Left) & OP No. (Right)                    */}
        {/* ============================================================== */}
        {fullName && (
          <text
            x="218"
            y="415"
            className="inv-field-text"
            fontSize={fullName.length > 24 ? "19px" : "22px"}
          >
            {fullName}
          </text>
        )}

        {opNo && (
          <text
            x="822"
            y="415"
            className="inv-field-text"
            fontSize={opNo.length > 14 ? "19px" : "22px"}
          >
            {opNo}
          </text>
        )}

        {/* ============================================================== */}
        {/* ROW 2: Age / Sex (Left) & Date (Right)                         */}
        {/* ============================================================== */}
        {ageSexDisplay && (
          <text
            x="218"
            y="460"
            className="inv-field-text"
            fontSize={ageSexDisplay.length > 24 ? "19px" : "22px"}
          >
            {ageSexDisplay}
          </text>
        )}

        {formattedDate && (
          <text
            x="822"
            y="460"
            className="inv-field-text"
          >
            {formattedDate}
          </text>
        )}

        {/* ============================================================== */}
        {/* ROW 3: Invoice No. (Left)                                      */}
        {/* ============================================================== */}
        {invoiceNo && (
          <text
            x="218"
            y="505"
            className="inv-field-text"
            fontSize={invoiceNo.length > 24 ? "19px" : "22px"}
          >
            {invoiceNo}
          </text>
        )}

        {/* ============================================================== */}
        {/* VERTICAL TREATMENT LIST & AMOUNTS (Reference Matching Layout)   */}
        {/* ============================================================== */}
        {layout.rows.map((row, idx) => (
          <g key={idx}>
            {/* Number / Sub-prefix */}
            <text
              x={row.isSubItem ? "125" : "75"}
              y={row.y}
              className="inv-row-num"
            >
              {row.prefix}
            </text>

            {/* Description Lines */}
            {row.descriptionLines.map((line, lIdx) => (
              <text
                key={lIdx}
                x={row.isSubItem ? "155" : "115"}
                y={row.y + lIdx * 29}
                className="inv-row-desc"
              >
                {line}
              </text>
            ))}

            {/* Amount Right-Aligned */}
            {row.amountStr && (
              <text
                x="985"
                y={row.y}
                textAnchor="end"
                className="inv-row-amt"
              >
                {row.amountStr}
              </text>
            )}
          </g>
        ))}

        {/* Horizontal Divider Line beneath the last treatment */}
        <line
          x1="65"
          y1={layout.dividerY}
          x2="985"
          y2={layout.dividerY}
          stroke="#111827"
          strokeWidth="1.8"
        />

        {/* Financial Summary (Right-aligned beneath divider) */}
        {layout.hasDiscount && (
          <>
            <text x="985" y={layout.subtotalY} textAnchor="end" className="inv-sub-text">
              Subtotal :  {formatInvoiceCurrency(subtotal)}
            </text>
            <text x="985" y={layout.discountY} textAnchor="end" className="inv-sub-text" fill="#dc2626">
              Discount {isFixedDiscount ? "" : `(${invoice?.discount}%)`} :  -{formatInvoiceCurrency(discountAmt)}
            </text>
          </>
        )}

        {/* Prominent Total Line */}
        <text x="985" y={layout.totalY} textAnchor="end" className="inv-total-text">
          Total :  {formatInvoiceCurrency(total)}
        </text>

        {/* Payment and Balance Breakdown (only if payments were logged) */}
        {layout.hasPayment && (
          <>
            <text x="985" y={layout.paidY} textAnchor="end" className="inv-sub-text" fill="#059669">
              Amount Paid :  {formatInvoiceCurrency(paidAmount)}
            </text>
            <text
              x="985"
              y={layout.balanceY}
              textAnchor="end"
              className="inv-sub-text"
              fill={balanceDue > 0 ? "#dc2626" : "#059669"}
            >
              Balance Due :  {balanceDue > 0 ? formatInvoiceCurrency(balanceDue) : "Rs. 0.00 (Paid in Full)"}
            </text>
          </>
        )}

        {/* Overflow Alert Warning if treatments exceed single-page capacity */}
        {layout.isOverflow && (
          <text
            x="532"
            y="1330"
            textAnchor="middle"
            fill="#dc2626"
            fontSize="13px"
            fontWeight="700"
          >
            ⚠️ Notice: Treatment list exceeds single-page capacity.
          </text>
        )}
      </svg>
    </div>
  );
};
