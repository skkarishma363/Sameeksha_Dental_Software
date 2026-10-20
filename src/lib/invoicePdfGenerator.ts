import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import { formatInvoiceDate, InvoiceLineItem } from "@/components/OfficialSameekshaInvoice";

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
  };
  dateStr?: string;
}

/**
 * Generates and triggers download of an authentic Sameeksha Super Speciality Dental Hospital
 * invoice PDF using the fixed original invoice template background with full treatment
 * line items and financial calculations.
 *
 * Implements proportional 'contain' scaling centered on A4 to prevent any top or bottom cropping.
 */
export async function downloadSameekshaInvoicePDF(
  data: InvoicePdfData
): Promise<{ success: boolean; isOverflow: boolean }> {
  if (typeof window === "undefined") {
    return { success: false, isOverflow: false };
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

        // 7. Resolve Treatment Line Items & Charges
        const rawItems: any[] = Array.isArray(data.invoice.items) && data.invoice.items.length > 0
          ? data.invoice.items
          : (data.invoice.treatment
              ? [{
                  description: data.invoice.treatment,
                  quantity: 1,
                  unitPrice: Number(data.invoice.total || data.invoice.subtotal || 0),
                  amount: Number(data.invoice.total || data.invoice.subtotal || 0)
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

        // 8. Calculations
        const calculatedSubtotal = items.reduce((sum, it) => sum + it.amount, 0);
        const subtotal = Number(data.invoice.subtotal) || calculatedSubtotal || Number(data.invoice.total) || 0;

        const discountVal = Number(data.invoice.discountValue !== undefined ? data.invoice.discountValue : data.invoice.discount) || 0;
        const isFixedDiscount = data.invoice.discountType === "fixed";
        const discountAmt = isFixedDiscount
          ? discountVal
          : (subtotal * (Number(data.invoice.discount) || 0)) / 100;

        const taxPct = Number(data.invoice.tax) || 0;
        const taxAmt = ((subtotal - discountAmt) * taxPct) / 100;

        const calculatedTotal = Math.max(0, Math.round(subtotal - discountAmt + taxAmt));
        const total = Number(data.invoice.total) || calculatedTotal || subtotal;
        const paidAmount = Number(data.invoice.paidAmount) || (data.invoice.status === "Paid" ? total : 0);
        const balanceDue = Math.max(0, total - paidAmount);
        const paymentMode = data.invoice.paymentLogs?.[0]?.method || (paidAmount > 0 ? "Cash" : "");

        // 9. Render Treatment Table onto Canvas
        const tableStartY = 545;
        const headerHeight = 36;
        const rowStartY = tableStartY + headerHeight + 10;
        const rowHeight = items.length > 7 ? 32 : 36;
        const maxDisplayRows = 10;
        const visibleItems = items.slice(0, maxDisplayRows);
        const isOverflow = items.length > maxDisplayRows;

        // Draw Table Header Bar
        ctx.fillStyle = "#f8fafc";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(65, tableStartY, 934, headerHeight, 4) : ctx.rect(65, tableStartY, 934, headerHeight);
        ctx.fill();
        ctx.stroke();

        // Table Header Text
        ctx.fillStyle = "#002244";
        ctx.font = "bold 13.5px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("#", 95, tableStartY + 23);
        ctx.textAlign = "left";
        ctx.fillText("TREATMENT / PROCEDURE", 135, tableStartY + 23);
        ctx.textAlign = "center";
        ctx.fillText("QTY", 640, tableStartY + 23);
        ctx.textAlign = "right";
        ctx.fillText("UNIT PRICE (₹)", 790, tableStartY + 23);
        ctx.fillText("TOTAL (₹)", 975, tableStartY + 23);

        // Draw Rows
        visibleItems.forEach((item, idx) => {
          const rowY = rowStartY + idx * rowHeight + 22;
          const dividerY = rowStartY + (idx + 1) * rowHeight;

          ctx.textAlign = "center";
          ctx.fillStyle = "#0f172a";
          ctx.font = "15px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(String(idx + 1), 95, rowY);

          ctx.textAlign = "left";
          ctx.fillStyle = "#002244";
          ctx.font = "bold 15.5px 'Segoe UI', Arial, -apple-system, sans-serif";
          const desc = item.description.length > 48 ? item.description.slice(0, 47) + "…" : item.description;
          ctx.fillText(desc, 135, rowY);

          ctx.textAlign = "center";
          ctx.fillStyle = "#0f172a";
          ctx.font = "15px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(String(item.quantity || 1), 640, rowY);

          ctx.textAlign = "right";
          ctx.fillText(`₹${(item.unitPrice || 0).toLocaleString()}`, 790, rowY);

          ctx.font = "bold 15.5px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#002244";
          ctx.fillText(`₹${item.amount.toLocaleString()}`, 975, rowY);

          // Row divider
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(65, dividerY);
          ctx.lineTo(999, dividerY);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Overflow Warning Note
        const rowsEnd = rowStartY + visibleItems.length * rowHeight;
        if (isOverflow) {
          ctx.textAlign = "center";
          ctx.fillStyle = "#dc2626";
          ctx.font = "bold 13px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(`⚠️ Showing first ${maxDisplayRows} of ${items.length} treatments. Additional items exceed single-page capacity.`, 532, rowsEnd + 16);
        }

        // 10. Financial Summary & Signatory Section
        const summaryTop = Math.max(rowsEnd + 20, 780);
        const hasDiscount = discountAmt > 0;
        const summaryHeight = hasDiscount ? 170 : 145;

        // Left Side Signatory Text
        ctx.textAlign = "left";
        ctx.fillStyle = "#002244";
        ctx.font = "bold 15px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Dr. Suvarna Raju. P", 75, summaryTop + 24);

        ctx.fillStyle = "#475569";
        ctx.font = "600 13px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("BDS (Reg no. A-8103)", 75, summaryTop + 44);

        ctx.fillStyle = "#002244";
        ctx.font = "bold 13px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Authorized Signatory", 75, summaryTop + 66);

        ctx.fillStyle = "#64748b";
        ctx.font = "12px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Sameeksha Super Speciality Dental Hospital", 75, summaryTop + 86);

        if (paymentMode) {
          ctx.fillStyle = "#0284c7";
          ctx.font = "bold 13px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(`Payment Mode: ${paymentMode}`, 75, summaryTop + 112);
        }

        // Right Side Financial Box
        ctx.fillStyle = "#f8fafc";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(560, summaryTop, 439, summaryHeight, 6) : ctx.rect(560, summaryTop, 439, summaryHeight);
        ctx.fill();
        ctx.stroke();

        // Subtotal
        ctx.textAlign = "right";
        ctx.fillStyle = "#475569";
        ctx.font = "600 14.5px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Subtotal :", 760, summaryTop + 26);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 15.5px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText(`₹${subtotal.toLocaleString()}`, 975, summaryTop + 26);

        // Discount
        if (hasDiscount) {
          ctx.fillStyle = "#475569";
          ctx.font = "600 14.5px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(`Discount ${isFixedDiscount ? "" : `(${data.invoice.discount}%)`} :`, 760, summaryTop + 50);
          ctx.fillStyle = "#dc2626";
          ctx.font = "bold 15.5px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(`-₹${discountAmt.toLocaleString()}`, 975, summaryTop + 50);
        }

        // Total Banner
        const bannerY = summaryTop + (hasDiscount ? 64 : 40);
        ctx.fillStyle = "#002244";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(562, bannerY, 435, 38, 3) : ctx.rect(562, bannerY, 435, 38);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("TOTAL PAYABLE :", 760, bannerY + 25);
        ctx.font = "bold 19px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText(`₹${total.toLocaleString()}`, 975, bannerY + 26);

        // Paid & Balance Due
        const statsY = summaryTop + (hasDiscount ? 124 : 100);
        ctx.fillStyle = "#475569";
        ctx.font = "600 14.5px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Paid Amount :", 760, statsY);
        ctx.fillStyle = "#059669";
        ctx.font = "bold 15px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText(`₹${paidAmount.toLocaleString()}`, 975, statsY);

        ctx.fillStyle = "#475569";
        ctx.font = "600 14.5px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText("Balance Due :", 760, statsY + 22);
        ctx.fillStyle = balanceDue > 0 ? "#dc2626" : "#059669";
        ctx.font = "bold 15px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillText(balanceDue > 0 ? `₹${balanceDue.toLocaleString()}` : "✓ PAID IN FULL", 975, statsY + 22);

        // 11. Build PDF with jsPDF (A4 standard format with proportional scaling & centering)
        // Image aspect ratio: 1064 / 1479 = 0.719405
        // On standard A4 (210 x 297 mm):
        // Printable width = 200 mm -> Proportional height = 200 * (1479 / 1064) = 278.0075 mm
        // X offset = (210 - 200) / 2 = 5.0 mm
        // Y offset = (297 - 278.0075) / 2 = 9.496 mm
        // This guarantees all 4 borders (top, bottom, left, right) are 100% visible with zero clipping!
        const imgData = canvas.toDataURL("image/jpeg", 0.96);
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        doc.addImage(imgData, "JPEG", 5, 9.5, 200, 278);

        const safePatientName = (fullName || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeInvoiceNo = (invoiceNo || "Invoice").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDate = formattedDate.replace(/[^a-zA-Z0-9_-]/g, "-");
        const fileName = `Sameeksha_Invoice_${safePatientName}_${safeInvoiceNo}_${safeDate}.pdf`;

        doc.save(fileName);
        resolve({ success: true, isOverflow });
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load invoice template background: " + err));
      };
    } catch (err) {
      reject(err);
    }
  });
}
