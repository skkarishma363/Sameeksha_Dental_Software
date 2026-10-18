import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import { parsePrescriptionItem, PrescribedMedicineItem } from "@/components/OfficialSameekshaPrescription";

export interface PrescriptionPdfData {
  patient: {
    id?: string | number;
    patient_id?: string | number;
    name?: string;
    firstName?: string;
    lastName?: string;
    age?: string | number;
    gender?: string;
    visit?: string;
    [key: string]: any;
  };
  medicines?: (string | PrescribedMedicineItem)[];
  dateStr?: string;
  diagnosis?: string;
  advice?: string;
  doctorName?: string;
}

/**
 * Wraps text into lines based on approximate character length.
 */
function wrapLines(text: string, maxChars: number): string[] {
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

/**
 * Generates and triggers download of an authentic Sameeksha Super Speciality Dental Hospital
 * prescription PDF using the fixed original prescription template background.
 */
export async function downloadSameekshaPrescriptionPDF(
  data: PrescriptionPdfData
): Promise<{ success: boolean; isOverflow: boolean }> {
  if (typeof window === "undefined") {
    return { success: false, isOverflow: false };
  }

  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = getAssetPath("/Sameeksha_Prescription.png");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1028;
        canvas.height = 1530;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context"));
          return;
        }

        // 1. Draw Authentic Template Background
        ctx.drawImage(img, 0, 0, 1028, 1530);

        // 2. Patient Name
        const fullName = (
          data.patient.name ||
          `${data.patient.firstName || ""} ${data.patient.lastName || ""}`.trim() ||
          ""
        ).trim();

        if (fullName) {
          const fontSize = fullName.length > 28 ? 18 : 21;
          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, -apple-system, sans-serif`;
          ctx.fillStyle = "#002244";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(fullName, 190, 432);
        }

        // 3. Age / Sex
        const ageVal = data.patient.age ? `${data.patient.age} Yrs` : "";
        const rawGender = String(data.patient.gender || "").trim();
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

        if (ageSexDisplay) {
          ctx.font = "bold 21px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(ageSexDisplay, 805, 432);
        }

        // 4. Date
        const finalDate =
          data.dateStr ||
          data.patient.visit ||
          new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

        if (finalDate) {
          ctx.font = "bold 21px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(finalDate, 780, 492);
        }

        // 5. Prescribed Medicines & Instructions
        let curY = 575;
        const parsedMeds = (data.medicines || [])
          .map(parsePrescriptionItem)
          .filter((m) => m.name.trim().length > 0);

        // Optional Diagnosis
        if (data.diagnosis && data.diagnosis.trim()) {
          ctx.font = "bold 17px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          ctx.fillText("Diagnosis: ", 85, curY);

          ctx.font = "normal 16px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#1e293b";
          const diagLines = wrapLines(data.diagnosis.trim(), 70);
          diagLines.forEach((l, idx) => {
            ctx.fillText(l, idx === 0 ? 175 : 85, curY + idx * 22);
          });
          curY += Math.max(26, diagLines.length * 22 + 10);
        }

        // Medicines
        parsedMeds.forEach((med, idx) => {
          const itemNum = `${idx + 1}.`;
          const nameLines = wrapLines(med.name.trim(), 55);

          ctx.font = "bold 19px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          nameLines.forEach((nl, nIdx) => {
            ctx.fillText(nIdx === 0 ? `${itemNum}  ${nl}` : nl, nIdx === 0 ? 85 : 115, curY + nIdx * 24);
          });
          curY += nameLines.length * 24 + 4;

          const subParts: string[] = [];
          if (med.dosage) subParts.push(`Dosage: ${med.dosage}`);
          if (med.timing) subParts.push(med.timing);
          if (med.duration) subParts.push(`Duration: ${med.duration}`);

          if (subParts.length > 0) {
            ctx.font = "normal 16px 'Segoe UI', Arial, -apple-system, sans-serif";
            ctx.fillStyle = "#1e293b";
            const subStr = subParts.join("   |   ");
            const subLines = wrapLines(subStr, 68);
            subLines.forEach((sl, sIdx) => {
              ctx.fillText(sl, 115, curY + sIdx * 20);
            });
            curY += subLines.length * 20 + 2;
          }

          if (med.instructions && med.instructions.trim()) {
            ctx.font = "normal 15px 'Segoe UI', Arial, -apple-system, sans-serif";
            ctx.fillStyle = "#475569";
            const instLines = wrapLines(`Instructions: ${med.instructions.trim()}`, 70);
            instLines.forEach((il, iIdx) => {
              ctx.fillText(il, 115, curY + iIdx * 20);
            });
            curY += instLines.length * 20 + 2;
          }

          curY += 14;
        });

        // Doctor Advice & Instructions
        if (data.advice && data.advice.trim()) {
          curY += 12;
          ctx.font = "bold 18px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          ctx.fillText("Doctor Advice & Instructions:", 85, curY);
          curY += 26;

          ctx.font = "normal 16px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#1e293b";
          const paragraphs = data.advice.split("\n");
          for (const p of paragraphs) {
            if (!p.trim()) continue;
            const pClean = p.trim().startsWith("•") || p.trim().startsWith("-") ? p.trim() : `• ${p.trim()}`;
            const wrappedP = wrapLines(pClean, 72);
            wrappedP.forEach((wl, wIdx) => {
              ctx.fillText(wl, wIdx === 0 ? 115 : 130, curY);
              curY += 22;
            });
            curY += 4;
          }
        }

        // Doctor Signature Block
        ctx.font = "bold 20px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillStyle = "#002244";
        ctx.fillText(data.doctorName || "Dr. Suvarna Raju.P", 720, 1345);

        ctx.font = "normal 15px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Authorized Signature", 720, 1368);

        const isOverflow = curY > 1380;

        // 6. Build PDF with jsPDF
        const imgData = canvas.toDataURL("image/jpeg", 0.96);
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);

        const safePatientName = (fullName || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDate = finalDate.replace(/[^a-zA-Z0-9_-]/g, "-");
        const fileName = `Sameeksha_Prescription_${safePatientName}_${safeDate}.pdf`;

        doc.save(fileName);
        resolve({ success: true, isOverflow });
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load prescription template background: " + err));
      };
    } catch (err) {
      reject(err);
    }
  });
}
