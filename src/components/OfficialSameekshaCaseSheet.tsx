"use client";

import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";
import { formatInvoiceDate } from "@/lib/date-utils";

export interface OfficialSameekshaCaseSheetProps {
  patient: {
    id?: string | number;
    patient_id?: string | number;
    name?: string;
    firstName?: string;
    lastName?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    visit?: string;
    firstVisit?: string;
    [key: string]: any;
  };
  chiefComplaint?: string;
  intraOralExam?: string;
  provisionalDiagnosis?: string;
  treatmentAdvised?: string;
  medicalHistoryConditions?: string[];
  medicalHistoryOthers?: string;
  currentMedications?: string;
  refDoctor?: string;
  dateStr?: string;
  className?: string;
}

/**
 * Natural text wrapper for clinical sections.
 * Accounts for first-line indent following printed section headers and wraps
 * within the clinical writing column, staying safely clear of right vertical columns (x = 788).
 */
function wrapClinicalText(
  text: string | undefined,
  firstLineMaxChars: number,
  subsequentMaxChars: number,
  isTwoLineHeader = false
): string[] {
  if (!text || !text.trim()) return [];
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const words = para.trim().split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const isIndented = isTwoLineHeader ? lines.length < 2 : lines.length === 0;
      const maxLen = isIndented ? firstLineMaxChars : subsequentMaxChars;
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length <= maxLen) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

export const OfficialSameekshaCaseSheet: React.FC<OfficialSameekshaCaseSheetProps> = ({
  patient,
  chiefComplaint = "",
  intraOralExam = "",
  provisionalDiagnosis = "",
  treatmentAdvised = "",
  medicalHistoryConditions = [],
  medicalHistoryOthers = "",
  currentMedications = "",
  refDoctor = "",
  dateStr,
  className = "",
}) => {
  const assetSrc = getAssetPath("/Sameeksha_CaseSheet.png");

  // Patient Name: 22px bold (19px if exceptionally long)
  const fullName = (
    patient.name ||
    `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
    ""
  ).trim();

  // Patient Age: 22px bold
  const ageDisplay = patient.age ? `${patient.age} Yrs` : "";

  // Patient Gender: 22px bold text (no circle)
  const genderRaw = String(patient.gender || "").trim();
  let genderDisplay = "";
  if (/^f/i.test(genderRaw)) genderDisplay = "Female";
  else if (/^m/i.test(genderRaw)) genderDisplay = "Male";
  else if (genderRaw) genderDisplay = genderRaw;

  // Phone: 22px bold
  const phoneDisplay = patient.phone || "";

  // Date: 22px bold
  const finalDate = formatInvoiceDate(dateStr || patient.visit || patient.firstVisit || null);

  // OP Number: Extract numeric digits from patient ID (e.g. "DS-1002" -> "1002")
  const rawId = String(patient.id || patient.patient_id || "");
  const numMatches = rawId.replace(/\D/g, "");
  const paddedDigits = numMatches
    ? numMatches.padStart(6, " ").slice(-6)
    : rawId.padStart(6, " ").slice(-6);
  const opDigits = Array.from({ length: 6 }, (_, i) => paddedDigits[i] || " ");

  // Medical History Condition Matching
  const hasCondition = (matcher: RegExp | string) => {
    return medicalHistoryConditions.some((c) => {
      const str = String(c || "").trim().toLowerCase();
      if (typeof matcher === "string") {
        return str === matcher.toLowerCase();
      }
      return matcher.test(str);
    });
  };

  const isDiabetes = hasCondition(/diabet/i);
  const isBp = hasCondition(/b\.?p|hyper|blood\s*press/i);
  const isHeart = hasCondition(/heart|cardio/i);
  const isAllergies = hasCondition(/allerg/i);
  const isBleeding = hasCondition(/bleed/i);
  const isPregnancy = hasCondition(/pregnan/i);
  const isThyroid = hasCondition(/thyroid/i);

  // Checkmark SVG path helper: centered inside 26x26 square checkbox outlines (3.6px bold stroke)
  const renderCheckmark = (cx: number, cy: number) => (
    <path
      d={`M ${cx - 8} ${cy} L ${cx - 1} ${cy + 7} L ${cx + 9} ${cy - 8}`}
      fill="none"
      stroke="#002b66"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  // Helper to render clinical notes block (21px bold text, auto-scales to 18px if long)
  const renderClinicalSection = (
    text: string,
    startX: number,
    startY: number,
    firstLineMaxChars: number,
    subsequentMaxChars: number,
    isChiefComplaint = false
  ) => {
    if (!text || !text.trim()) return null;
    const lines = wrapClinicalText(
      text,
      firstLineMaxChars,
      subsequentMaxChars,
      isChiefComplaint
    );
    if (!lines.length) return null;

    // Dynamically adjust font-size if text has many lines to ensure it stays in bounds
    const isLong = lines.length > 4;
    const fontSize = isLong ? 18 : 21;
    const lineGap = isLong ? 24 : 28;

    return (
      <g>
        {lines.map((line, idx) => {
          let x = 65;
          let y = startY + idx * lineGap;

          if (isChiefComplaint) {
            // Chief Complaint & Past Dental History has a 2-line printed header
            if (idx === 0) {
              x = startX;
              y = startY;
            } else if (idx === 1) {
              x = startX;
              y = startY + lineGap;
            } else {
              x = 65;
              // Clear Past Dental History heading cleanly
              y = startY + 2 * lineGap + 14 + (idx - 2) * lineGap;
            }
          } else {
            // Single-line header sections (Intra Oral Exam, Provisional Diagnosis, Treatment Advised)
            if (idx === 0) {
              x = startX;
              y = startY;
            } else {
              x = 65;
              y = startY + idx * lineGap;
            }
          }

          return (
            <text
              key={idx}
              x={x}
              y={y}
              fontFamily="'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif"
              fontWeight="600"
              fontSize={fontSize}
              fill="#0a192f"
            >
              {line}
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <div
      className={`official-case-sheet-container relative bg-white select-none ${className}`}
      style={{
        width: "100%",
        maxWidth: "210mm",
        aspectRatio: "1065 / 1477",
        margin: "0 auto",
      }}
    >
      {/* 1. Authentic Template Image Background */}
      <img
        src={assetSrc}
        alt="Sameeksha Super Speciality Dental Hospital Case Sheet Template"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* 2. Mathematical Coordinate Overlay SVG */}
      <svg
        viewBox="0 0 1065 1477"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <style>{`
            .cs-field-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 700;
              font-size: 22px;
              fill: #002244;
            }
            .cs-med-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 600;
              font-size: 21px;
              fill: #0a192f;
            }
          `}</style>
        </defs>

        {/* ============================================================== */}
        {/* O.P. No. 6-DIGIT BOX OVERLAY                                   */}
        {/* Covers scanned 18830 stamp with clean white slots & dividers  */}
        {/* Bounds: x: 750..1002, y: 168..205.5 (width: 252px, height: 37.5px) */}
        {/* ============================================================== */}
        <rect
          x="750"
          y="168"
          width="252"
          height="37.5"
          fill="#ffffff"
          stroke="#002b66"
          strokeWidth="2"
        />
        {/* Slot Dividers */}
        <line x1="792" y1="168" x2="792" y2="205.5" stroke="#002b66" strokeWidth="1.5" />
        <line x1="834" y1="168" x2="834" y2="205.5" stroke="#002b66" strokeWidth="1.5" />
        <line x1="876" y1="168" x2="876" y2="205.5" stroke="#002b66" strokeWidth="1.5" />
        <line x1="918" y1="168" x2="918" y2="205.5" stroke="#002b66" strokeWidth="1.5" />
        <line x1="960" y1="168" x2="960" y2="205.5" stroke="#002b66" strokeWidth="1.5" />

        {/* 6 Digit Values (horizontally and vertically centered in slots, 24px bold) */}
        {opDigits.map((digit, i) => {
          const cx = 750 + i * 42 + 21;
          return (
            <text
              key={i}
              x={cx}
              y="186.75"
              dominantBaseline="central"
              textAnchor="middle"
              fontFamily="'Lucida Console', Monaco, monospace, sans-serif"
              fontWeight="900"
              fontSize="24px"
              fill="#002b66"
            >
              {digit}
            </text>
          );
        })}

        {/* ============================================================== */}
        {/* DATE FIELD (22px bold)                                         */}
        {/* Printed label 'Date :' ends at x: 796, baseline y: 230         */}
        {/* ============================================================== */}
        {finalDate && (
          <text x="822" y="230" className="cs-field-text">
            {finalDate}
          </text>
        )}

        {/* ============================================================== */}
        {/* CONTACT INFORMATION SECTION (22px bold)                        */}
        {/* Row 1 baseline: y = 310; Row 2 baseline: y = 376               */}
        {/* Typography: 22px bold (matches printed labels)                */}
        {/* ============================================================== */}
        {/* Name: Starts after 'Name :' at x: 145, y: 310 */}
        {fullName && (
          <text
            x="145"
            y="310"
            className="cs-field-text"
            fontSize={fullName.length > 28 ? "19px" : "22px"}
          >
            {fullName}
          </text>
        )}

        {/* Age: Starts after 'Age :' at x: 685, y: 310 */}
        {ageDisplay && (
          <text x="685" y="310" className="cs-field-text">
            {ageDisplay}
          </text>
        )}

        {/* Gender: Aligned with label at x: 925, y: 310 (text value, no circle) */}
        {genderDisplay && (
          <text x="925" y="310" className="cs-field-text">
            {genderDisplay}
          </text>
        )}

        {/* Tel No.: Starts after 'Tel No.' at x: 145, y: 376 */}
        {phoneDisplay && (
          <text x="145" y="376" className="cs-field-text">
            {phoneDisplay}
          </text>
        )}

        {/* Ref: Starts after 'Ref :' at x: 685, y: 376 */}
        {refDoctor && (
          <text x="685" y="376" className="cs-field-text">
            {refDoctor}
          </text>
        )}

        {/* ============================================================== */}
        {/* MEDICAL HISTORY CHECKBOXES (3.6px bold checkmarks)             */}
        {/* Centers precisely measured to fit within 26x26 square outlines */}
        {/* ============================================================== */}
        {isDiabetes && renderCheckmark(173.5, 484.5)}
        {isBp && renderCheckmark(378.5, 485.5)}
        {isHeart && renderCheckmark(694.5, 486.5)}
        {isAllergies && renderCheckmark(888.5, 486.5)}
        {isBleeding && renderCheckmark(257.5, 549.5)}
        {isPregnancy && renderCheckmark(436.5, 551.5)}
        {isThyroid && renderCheckmark(695.5, 552.5)}

        {/* Others: Text rests on top of printed underline (baseline y = 560, 21px) */}
        {medicalHistoryOthers && (
          <text x="845" y="560" className="cs-med-text">
            {medicalHistoryOthers}
          </text>
        )}

        {/* Medications if any: Text rests on top of underline (baseline y = 624, 21px) */}
        {currentMedications && (
          <text x="275" y="624" className="cs-med-text">
            {currentMedications}
          </text>
        )}

        {/* ============================================================== */}
        {/* CLINICAL CASE DETAILS (21px bold text)                         */}
        {/* Typography: 21px matching printed text, natural wrapping       */}
        {/* Stays safely inside clinical column (x < 770), blank if empty  */}
        {/* ============================================================== */}
        {/* 1. Chief Complaint & Past Dental History */}
        {renderClinicalSection(chiefComplaint, 268, 664, 44, 64, true)}

        {/* 2. Intra Oral Examination */}
        {renderClinicalSection(intraOralExam, 312, 802, 43, 66, false)}

        {/* 3. Provisional Diagnosis */}
        {renderClinicalSection(provisionalDiagnosis, 308, 902, 43, 66, false)}

        {/* 4. Treatment Advised */}
        {renderClinicalSection(treatmentAdvised, 275, 1003, 46, 66, false)}
      </svg>
    </div>
  );
};
