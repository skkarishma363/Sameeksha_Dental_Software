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

/**
 * Formats date into standard DD/MM/YYYY for display on the official printed invoice.
 */
export function formatInvoiceDate(rawDate?: string): string {
  if (!rawDate || !rawDate.trim()) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  const clean = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate.split(" ")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [yyyy, mm, dd] = clean.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }
  return clean;
}

/**
 * Official Sameeksha Super Speciality Dental Hospital Invoice Component.
 *
 * Uses the exact supplied authentic invoice template as a fixed background
 * ('Sameeksha Dental Hospital Invoice Template(1).png') and overlays dynamic
 * database values at mathematical pixel coordinates matching the printed lines
 * and the treatments/charges area above the bottom horizontal border line.
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

  const paymentMode = invoice?.paymentLogs?.[0]?.method || (paidAmount > 0 ? "Cash" : "");

  // Table coordinates
  const tableStartY = 545;
  const headerHeight = 36;
  const rowStartY = tableStartY + headerHeight + 10;
  const rowHeight = items.length > 7 ? 32 : 36;
  const maxDisplayRows = 10;
  const visibleItems = items.slice(0, maxDisplayRows);
  const isOverflow = items.length > maxDisplayRows;

  // Summary box positioning (anchored cleanly below rows and above line y = 1342)
  const rowsEnd = rowStartY + visibleItems.length * rowHeight;
  const summaryTop = Math.max(rowsEnd + 20, 780);
  const hasDiscount = discountAmt > 0;
  const summaryHeight = hasDiscount ? 170 : 145;

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
            .inv-th-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 700;
              font-size: 13.5px;
              letter-spacing: 0.5px;
              fill: #002244;
            }
            .inv-td-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 15px;
              fill: #0f172a;
            }
            .inv-td-desc {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 15.5px;
              font-weight: 600;
              fill: #002244;
            }
            .inv-sum-label {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 14.5px;
              font-weight: 600;
              fill: #475569;
            }
            .inv-sum-val {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 15.5px;
              font-weight: 700;
              fill: #0f172a;
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
        {/* TREATMENT & CHARGES TABLE (Clean Overlay above line y = 1342)  */}
        {/* ============================================================== */}

        {/* Table Header Bar */}
        <rect
          x="65"
          y={tableStartY}
          width="934"
          height={headerHeight}
          rx="4"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        <text x="95" y={tableStartY + 23} textAnchor="middle" className="inv-th-text">#</text>
        <text x="135" y={tableStartY + 23} className="inv-th-text">TREATMENT / PROCEDURE</text>
        <text x="640" y={tableStartY + 23} textAnchor="middle" className="inv-th-text">QTY</text>
        <text x="790" y={tableStartY + 23} textAnchor="end" className="inv-th-text">UNIT PRICE (₹)</text>
        <text x="975" y={tableStartY + 23} textAnchor="end" className="inv-th-text">TOTAL (₹)</text>

        {/* Table Rows */}
        {visibleItems.map((item, idx) => {
          const rowY = rowStartY + idx * rowHeight + 22;
          const dividerY = rowStartY + (idx + 1) * rowHeight;
          return (
            <g key={idx}>
              <text x="95" y={rowY} textAnchor="middle" className="inv-td-text">{idx + 1}</text>
              <text x="135" y={rowY} className="inv-td-desc">
                {item.description.length > 48 ? item.description.slice(0, 47) + "…" : item.description}
              </text>
              <text x="640" y={rowY} textAnchor="middle" className="inv-td-text">{item.quantity || 1}</text>
              <text x="790" y={rowY} textAnchor="end" className="inv-td-text">
                ₹{(item.unitPrice || 0).toLocaleString()}
              </text>
              <text x="975" y={rowY} textAnchor="end" className="inv-td-desc">
                ₹{item.amount.toLocaleString()}
              </text>
              <line x1="65" y1={dividerY} x2="999" y2={dividerY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          );
        })}

        {/* Overflow Note if items exceed single page */}
        {isOverflow && (
          <text x="532" y={rowsEnd + 16} textAnchor="middle" fill="#dc2626" fontSize="13px" fontWeight="700">
            ⚠️ Showing first {maxDisplayRows} of {items.length} treatments. Additional items exceed single-page capacity.
          </text>
        )}

        {/* ============================================================== */}
        {/* FINANCIAL SUMMARY & SIGNATURE (Anchored cleanly above y = 1342) */}
        {/* ============================================================== */}

        {/* Left Side: Hospital & Signatory Information */}
        <g transform={`translate(75, ${summaryTop})`}>
          <text x="0" y="24" fontSize="15px" fontWeight="700" fill="#002244">Dr. Suvarna Raju. P</text>
          <text x="0" y="44" fontSize="13px" fontWeight="600" fill="#475569">BDS (Reg no. A-8103)</text>
          <text x="0" y="66" fontSize="13px" fontWeight="700" fill="#002244">Authorized Signatory</text>
          <text x="0" y="86" fontSize="12px" fill="#64748b">Sameeksha Super Speciality Dental Hospital</text>
          {paymentMode && (
            <text x="0" y="112" fontSize="13px" fontWeight="700" fill="#0284c7">
              Payment Mode: {paymentMode}
            </text>
          )}
        </g>

        {/* Right Side: Financial Calculation Box */}
        <rect
          x="560"
          y={summaryTop}
          width="439"
          height={summaryHeight}
          rx="6"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* Subtotal */}
        <text x="760" y={summaryTop + 26} textAnchor="end" className="inv-sum-label">Subtotal :</text>
        <text x="975" y={summaryTop + 26} textAnchor="end" className="inv-sum-val">₹{subtotal.toLocaleString()}</text>

        {/* Discount (if applicable) */}
        {hasDiscount && (
          <>
            <text x="760" y={summaryTop + 50} textAnchor="end" className="inv-sum-label">
              Discount {isFixedDiscount ? "" : `(${invoice?.discount}%)`} :
            </text>
            <text x="975" y={summaryTop + 50} textAnchor="end" className="inv-sum-val" fill="#dc2626">
              -₹{discountAmt.toLocaleString()}
            </text>
          </>
        )}

        {/* Total Payable Highlight Banner */}
        {(() => {
          const bannerY = summaryTop + (hasDiscount ? 64 : 40);
          return (
            <g>
              <rect
                x="562"
                y={bannerY}
                width="435"
                height="38"
                rx="3"
                fill="#002244"
              />
              <text x="760" y={bannerY + 25} textAnchor="end" fill="#ffffff" fontSize="15px" fontWeight="700">
                TOTAL PAYABLE :
              </text>
              <text x="975" y={bannerY + 26} textAnchor="end" fill="#ffffff" fontSize="19px" fontWeight="800">
                ₹{total.toLocaleString()}
              </text>
            </g>
          );
        })()}

        {/* Paid & Balance Breakdown */}
        {(() => {
          const statsY = summaryTop + (hasDiscount ? 124 : 100);
          return (
            <g>
              <text x="760" y={statsY} textAnchor="end" className="inv-sum-label">Paid Amount :</text>
              <text x="975" y={statsY} textAnchor="end" fontSize="15px" fontWeight="700" fill="#059669">
                ₹{paidAmount.toLocaleString()}
              </text>

              <text x="760" y={statsY + 22} textAnchor="end" className="inv-sum-label">Balance Due :</text>
              <text
                x="975"
                y={statsY + 22}
                textAnchor="end"
                fontSize="15px"
                fontWeight="700"
                fill={balanceDue > 0 ? "#dc2626" : "#059669"}
              >
                {balanceDue > 0 ? `₹${balanceDue.toLocaleString()}` : "✓ PAID IN FULL"}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};
