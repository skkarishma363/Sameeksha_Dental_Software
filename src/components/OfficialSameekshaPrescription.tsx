"use client";

import React, { useMemo } from "react";
import { getAssetPath } from "@/lib/getAssetPath";

export interface PrescribedMedicineItem {
  name: string;
  dosage?: string;
  freq?: string;
  timing?: string;
  duration?: string;
  instructions?: string;
  [key: string]: any;
}

export interface OfficialSameekshaPrescriptionProps {
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
  medicines?: (string | PrescribedMedicineItem)[];
  dateStr?: string;
  diagnosis?: string;
  advice?: string;
  doctorName?: string;
  className?: string;
  onOverflow?: (isOverflow: boolean) => void;
}

/**
 * Parses raw prescription strings or objects into structured items.
 * Handles strings like: "Tab. Augmentin 625mg (1-0-1 After Meals) for 5 days [Take with water]"
 */
export function parsePrescriptionItem(raw: string | PrescribedMedicineItem): PrescribedMedicineItem {
  if (typeof raw === "object" && raw !== null) {
    return {
      name: raw.name || raw.medicine_name || "",
      dosage: raw.dosage || raw.freq || "",
      timing: raw.timing || "",
      duration: raw.duration || "",
      instructions: raw.instructions || raw.advice || "",
    };
  }

  const str = String(raw || "").trim();
  if (!str) return { name: "" };

  const match = str.match(/^([^(]+?)(?:\s*\(([^)]+)\))?(?:\s*(?:for|-)\s*([^\[]+?))?(?:\s*\[([^\]]+)\])?$/i);
  if (match) {
    return {
      name: match[1]?.trim() || str,
      dosage: match[2]?.trim() || "",
      duration: match[3]?.trim() || "",
      instructions: match[4]?.trim() || "",
    };
  }
  return { name: str };
}

/**
 * Wrap text into lines of max characters
 */
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";

  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length <= maxChars) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export const OfficialSameekshaPrescription: React.FC<OfficialSameekshaPrescriptionProps> = ({
  patient,
  medicines = [],
  dateStr,
  diagnosis = "",
  advice = "",
  doctorName = "",
  className = "",
  onOverflow,
}) => {
  const assetSrc = getAssetPath("/Sameeksha_Prescription.png");

  // Patient Name: baseline y = 432, x = 190
  const fullName = (
    patient.name ||
    `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
    ""
  ).trim();

  // Age & Gender display: baseline y = 432, x = 805
  const ageVal = patient.age ? `${patient.age} Yrs` : "";
  const rawGender = String(patient.gender || "").trim();
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

  // Date: baseline y = 492, x = 780
  const finalDate =
    dateStr ||
    patient.visit ||
    patient.firstVisit ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Parse structured medicine items
  const parsedMeds = useMemo(() => {
    return medicines
      .map(parsePrescriptionItem)
      .filter((m) => m.name.trim().length > 0);
  }, [medicines]);

  // Layout calculation for SVG writing area
  const layout = useMemo(() => {
    let curY = 575;
    const elements: Array<{
      type: "medicine" | "diagnosis" | "advice" | "signature";
      y: number;
      lines: Array<{ x: number; y: number; text: string; bold?: boolean; color?: string; size?: number }>;
    }> = [];

    // Optional diagnosis / clinical note at top of Rx area if provided
    if (diagnosis.trim()) {
      const diagLines = wrapText(diagnosis.trim(), 64);
      const entryLines = [
        { x: 85, y: curY, text: "Diagnosis: ", bold: true, color: "#002244", size: 20 },
      ];
      diagLines.forEach((l, idx) => {
        entryLines.push({
          x: idx === 0 ? 190 : 85,
          y: curY + idx * 25,
          text: l,
          bold: false,
          color: "#1e293b",
          size: 19,
        });
      });
      elements.push({ type: "diagnosis", y: curY, lines: entryLines });
      curY += Math.max(30, diagLines.length * 25 + 10);
    }

    // Prescribed Medicines
    parsedMeds.forEach((med, idx) => {
      const itemNum = `${idx + 1}.`;
      const nameLines = wrapText(med.name.trim(), 48);
      const entryLines: Array<{ x: number; y: number; text: string; bold?: boolean; color?: string; size?: number }> = [];

      // Medicine Name
      nameLines.forEach((nl, nIdx) => {
        entryLines.push({
          x: nIdx === 0 ? 85 : 120,
          y: curY + nIdx * 28,
          text: nIdx === 0 ? `${itemNum}  ${nl}` : nl,
          bold: true,
          color: "#002244",
          size: 22,
        });
      });
      curY += nameLines.length * 28 + 4;

      // Dosage, Timing, Duration line
      const subParts: string[] = [];
      if (med.dosage) subParts.push(`Dosage: ${med.dosage}`);
      if (med.timing) subParts.push(med.timing);
      if (med.duration) subParts.push(`Duration: ${med.duration}`);

      if (subParts.length > 0) {
        const subStr = subParts.join("   |   ");
        const subLines = wrapText(subStr, 58);
        subLines.forEach((sl, sIdx) => {
          entryLines.push({
            x: 120,
            y: curY + sIdx * 24,
            text: sl,
            bold: false,
            color: "#1e293b",
            size: 19,
          });
        });
        curY += subLines.length * 24 + 3;
      }

      // Instructions / Advice
      if (med.instructions && med.instructions.trim()) {
        const instStr = `Instructions: ${med.instructions.trim()}`;
        const instLines = wrapText(instStr, 60);
        instLines.forEach((il, iIdx) => {
          entryLines.push({
            x: 120,
            y: curY + iIdx * 23,
            text: il,
            bold: false,
            color: "#475569",
            size: 18,
          });
        });
        curY += instLines.length * 23 + 3;
      }

      curY += 16; // gap between medicine entries
      elements.push({ type: "medicine", y: curY, lines: entryLines });
    });

    // Doctor Advice & Instructions
    if (advice.trim()) {
      curY += 14;
      const adviceEntryLines: Array<{ x: number; y: number; text: string; bold?: boolean; color?: string; size?: number }> = [
        { x: 85, y: curY, text: "Doctor Advice & Instructions:", bold: true, color: "#002244", size: 21 },
      ];
      curY += 30;

      const paragraphs = advice.split("\n");
      for (const p of paragraphs) {
        if (!p.trim()) continue;
        const pClean = p.trim().startsWith("•") || p.trim().startsWith("-") ? p.trim() : `• ${p.trim()}`;
        const wrappedP = wrapText(pClean, 62);
        wrappedP.forEach((wl, wIdx) => {
          adviceEntryLines.push({
            x: wIdx === 0 ? 120 : 138,
            y: curY,
            text: wl,
            bold: false,
            color: "#1e293b",
            size: 19,
          });
          curY += 26;
        });
        curY += 6;
      }
      elements.push({ type: "advice", y: curY, lines: adviceEntryLines });
    }

    // Overflow check: Bottom boundary before purple footer is y = 1380
    const isOverflow = curY > 1380;
    if (onOverflow) {
      onOverflow(isOverflow);
    }

    return { elements, finalY: curY, isOverflow };
  }, [diagnosis, parsedMeds, advice, onOverflow]);

  return (
    <div
      className={`official-prescription-container relative bg-white select-none ${className}`}
      style={{
        width: "100%",
        maxWidth: "210mm",
        aspectRatio: "1028 / 1530",
        margin: "0 auto",
      }}
    >
      {/* 1. Authentic Template Image Background */}
      <img
        src={assetSrc}
        alt="Sameeksha Super Speciality Dental Hospital Prescription Pad"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* 2. Mathematical Coordinate Overlay SVG */}
      <svg
        viewBox="0 0 1028 1530"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <style>{`
            .ps-field-text {
              font-family: 'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 700;
              font-size: 24px;
              fill: #002244;
            }
          `}</style>
        </defs>

        {/* ============================================================== */}
        {/* PATIENT DETAILS OVERLAY                                        */}
        {/* Exact alignment with printed labels and dotted lines           */}
        {/* ============================================================== */}

        {/* 1. Patient Name: Starts at x: 190, baseline y: 432 */}
        {fullName && (
          <text
            x="190"
            y="432"
            className="ps-field-text"
            fontSize={fullName.length > 28 ? "21px" : "24px"}
          >
            {fullName}
          </text>
        )}

        {/* 2. Age / Sex: Starts at x: 805, baseline y: 432 */}
        {ageSexDisplay && (
          <text x="805" y="432" className="ps-field-text">
            {ageSexDisplay}
          </text>
        )}

        {/* 3. Date: Starts at x: 780, baseline y: 492 */}
        {finalDate && (
          <text x="780" y="492" className="ps-field-text">
            {finalDate}
          </text>
        )}

        {/* ============================================================== */}
        {/* PRESCRIPTION CONTENT IN Rx AREA (Starts at y = 575)            */}
        {/* Clean typography, ample line gaps, respects watermark          */}
        {/* ============================================================== */}
        {layout.elements.map((elem, eIdx) => (
          <g key={eIdx}>
            {elem.lines.map((line, lIdx) => (
              <text
                key={lIdx}
                x={line.x}
                y={line.y}
                fontFamily="'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif"
                fontWeight={line.bold ? "700" : "500"}
                fontSize={line.size || 19}
                fill={line.color || "#1e293b"}
              >
                {line.text}
              </text>
            ))}
          </g>
        ))}

        {/* ============================================================== */}
        {/* DOCTOR SIGNATURE BLOCK (Positioned above bottom purple footer) */}
        {/* ============================================================== */}
        <text
          x="720"
          y="1342"
          fontFamily="'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="700"
          fontSize="23px"
          fill="#002244"
        >
          {doctorName || "Dr. Suvarna Raju.P"}
        </text>
        <text
          x="720"
          y="1368"
          fontFamily="'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="500"
          fontSize="17px"
          fill="#64748b"
        >
          Authorized Signature
        </text>
      </svg>
    </div>
  );
};
