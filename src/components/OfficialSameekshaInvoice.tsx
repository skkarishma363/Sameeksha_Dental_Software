"use client";

import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";

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
    date?: string;
    invoice_date?: string;
    paymentDate?: string;
    created_at?: string;
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
 * database values at mathematical pixel coordinates matching the printed lines.
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

  return (
    <div
      className={`official-invoice-container relative bg-white select-none ${className}`}
      style={{
        width: "100%",
        maxWidth: "210mm",
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
          `}</style>
        </defs>

        {/* ============================================================== */}
        {/* ROW 1: Patient Name (Left) & OP No. (Right)                    */}
        {/* ============================================================== */}

        {/* Patient Name: Sits right on underline (starts x = 218, baseline y = 415) */}
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

        {/* OP No.: Sits right on underline (starts x = 822, baseline y = 415) */}
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

        {/* Age / Sex: Sits right on underline (starts x = 218, baseline y = 460) */}
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

        {/* Date: Sits right on underline (starts x = 822, baseline y = 460) */}
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

        {/* Invoice No.: Sits right on underline (starts x = 218, baseline y = 505) */}
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
      </svg>
    </div>
  );
};
