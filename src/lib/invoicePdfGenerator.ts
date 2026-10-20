import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import {
  formatInvoiceDate,
  formatInvoiceCurrency,
  computeInvoiceLayout,
  InvoiceLineItem
} from "@/components/OfficialSameekshaInvoice";

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
 * invoice PDF using the fixed original invoice template background with a clean, vertically
 * arranged list of treatments, right-aligned amounts, and a prominent Total matching the
 * official reference invoice layout.
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

        // 9. Compute Vertical Layout matching the Reference Image
        const layout = computeInvoiceLayout(
          items,
          subtotal,
          discountAmt,
          total,
          paidAmount,
          balanceDue,
          575
        );

        // 10. Render Vertically Arranged Treatment Rows onto Canvas
        layout.rows.forEach((row) => {
          // Prefix/Number
          ctx.textAlign = "left";
          ctx.fillStyle = "#111827";
          ctx.font = "bold 20px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText(row.prefix, row.isSubItem ? 125 : 75, row.y);

          // Description lines
          ctx.font = "600 20px 'Segoe UI', Arial, -apple-system, sans-serif";
          row.descriptionLines.forEach((line, lIdx) => {
            ctx.fillText(line, row.isSubItem ? 155 : 115, row.y + lIdx * 25);
          });

          // Amount right-aligned
          if (row.amountStr) {
            ctx.textAlign = "right";
            ctx.font = "600 20px 'Segoe UI', Arial, -apple-system, sans-serif";
            ctx.fillText(row.amountStr, 985, row.y);
          }
        });

        // 11. Horizontal Divider Line beneath the last treatment
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(65, layout.dividerY);
        ctx.lineTo(985, layout.dividerY);
        ctx.stroke();

        // 12. Financial Summary (Right-aligned beneath divider)
        ctx.textAlign = "right";

        if (layout.hasDiscount) {
          ctx.font = "600 17px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#374151";
          ctx.fillText(`Subtotal :  ${formatInvoiceCurrency(subtotal)}`, 985, layout.subtotalY);

          ctx.fillStyle = "#dc2626";
          const discLabel = isFixedDiscount ? "Fixed" : `${data.invoice.discount}%`;
          ctx.fillText(`Discount (${discLabel}) :  -${formatInvoiceCurrency(discountAmt)}`, 985, layout.discountY);
        }

        // Prominent Total Line
        ctx.font = "bold 24px 'Segoe UI', Arial, -apple-system, sans-serif";
        ctx.fillStyle = "#000000";
        ctx.fillText(`Total :  ${formatInvoiceCurrency(total)}`, 985, layout.totalY);

        // Payment Breakdown (only if payments were logged)
        if (layout.hasPayment) {
          ctx.font = "600 17px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillStyle = "#059669";
          ctx.fillText(`Amount Paid :  ${formatInvoiceCurrency(paidAmount)}`, 985, layout.paidY);

          ctx.fillStyle = balanceDue > 0 ? "#dc2626" : "#059669";
          ctx.fillText(
            `Balance Due :  ${balanceDue > 0 ? formatInvoiceCurrency(balanceDue) : "Rs. 0.00 (Paid in Full)"}`,
            985,
            layout.balanceY
          );
        }

        // Overflow Alert Warning
        if (layout.isOverflow) {
          ctx.textAlign = "center";
          ctx.fillStyle = "#dc2626";
          ctx.font = "bold 13px 'Segoe UI', Arial, -apple-system, sans-serif";
          ctx.fillText("⚠️ Notice: Treatment list exceeds single-page capacity.", 532, 1330);
        }

        // 13. Build PDF with jsPDF (A4 standard format with proportional scaling & centering)
        // Image aspect ratio: 1064 / 1479 = 0.719405
        // On standard A4 (210 x 297 mm):
        // Printable width = 200 mm -> Proportional height = 200 * (1479 / 1064) = 278.0075 mm
        // X offset = (210 - 200) / 2 = 5.0 mm
        // Y offset = (297 - 278.0075) / 2 = 9.496 mm
        // Guarantees all 4 borders are 100% visible with zero clipping!
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
        resolve({ success: true, isOverflow: layout.isOverflow });
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load invoice template background: " + err));
      };
    } catch (err) {
      reject(err);
    }
  });
}
