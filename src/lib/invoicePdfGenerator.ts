import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import { formatInvoiceDate } from "@/components/OfficialSameekshaInvoice";

export interface InvoicePdfData {
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
    visit?: string;
    firstVisit?: string;
    [key: string]: any;
  } | null;
  invoice: {
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
  };
  dateStr?: string;
}

/**
 * Generates and triggers download of an authentic Sameeksha Super Speciality Dental Hospital
 * invoice PDF using the fixed original invoice template background.
 */
export async function downloadSameekshaInvoicePDF(
  data: InvoicePdfData
): Promise<{ success: boolean }> {
  if (typeof window === "undefined") {
    return { success: false };
  }

  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = getAssetPath("/Sameeksha Dental Hospital Invoice Template(1).png");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1064;
        canvas.height = 1479;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context"));
          return;
        }

        // 1. Draw Authentic Template Background
        ctx.drawImage(img, 0, 0, 1064, 1479);

        ctx.fillStyle = "#002244";
        ctx.textBaseline = "alphabetic";

        // 2. Patient Name: x = 218, y = 415
        const fullName = (
          data.patient?.name ||
          `${data.patient?.firstName || ""} ${data.patient?.lastName || ""}`.trim() ||
          data.invoice.patientName ||
          ""
        ).trim();

        if (fullName) {
          const fontSize = fullName.length > 24 ? 19 : 22;
          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, -apple-system, sans-serif`;
          ctx.fillText(fullName, 218, 415);
        }

        // 3. Age / Sex: x = 218, y = 460
        const ageVal = data.patient?.age ? `${data.patient.age} Yrs` : "";
        const rawGender = String(data.patient?.gender || "").trim();
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
          const fontSize = ageSexDisplay.length > 24 ? 19 : 22;
          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, -apple-system, sans-serif`;
          ctx.fillText(ageSexDisplay, 218, 460);
        }

        // 4. Invoice No.: x = 218, y = 505
        const invoiceNo = String(
          data.invoice.id ||
          data.invoice.invoice_id ||
          data.invoice.invoiceNo ||
          ""
        ).trim();

        if (invoiceNo) {
          const fontSize = invoiceNo.length > 24 ? 19 : 22;
          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, -apple-system, sans-serif`;
          ctx.fillText(invoiceNo, 218, 505);
        }

        // 5. OP No.: x = 822, y = 415
        const opNo = String(
          data.patient?.op_no ||
          data.patient?.opNumber ||
          data.patient?.id ||
          data.patient?.patient_id ||
          data.invoice.patientId ||
          ""
        ).trim();

        if (opNo) {
          const fontSize = opNo.length > 14 ? 19 : 22;
          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, -apple-system, sans-serif`;
          ctx.fillText(opNo, 822, 415);
        }

        // 6. Date: x = 822, y = 460
        const rawDate =
          data.dateStr ||
          data.invoice.paymentDate ||
          data.invoice.date ||
          data.invoice.invoice_date ||
          data.invoice.created_at ||
          data.patient?.visit ||
          data.patient?.firstVisit;
        const formattedDate = formatInvoiceDate(rawDate);

        if (formattedDate) {
          ctx.font = "bold 22px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(formattedDate, 822, 460);
        }

        // 7. Build PDF with jsPDF (A4 standard format)
        const imgData = canvas.toDataURL("image/jpeg", 0.96);
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);

        const safePatientName = (fullName || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeInvoiceNo = (invoiceNo || "Invoice").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDate = formattedDate.replace(/[^a-zA-Z0-9_-]/g, "-");
        const fileName = `Sameeksha_Invoice_${safePatientName}_${safeInvoiceNo}_${safeDate}.pdf`;

        doc.save(fileName);
        resolve({ success: true });
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load invoice template background: " + err));
      };
    } catch (err) {
      reject(err);
    }
  });
}
