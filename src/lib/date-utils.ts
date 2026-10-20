/**
 * Centralized Date & Time Utility for Sameeksha Dental Software (DentPro OS)
 * Clinic Timezone: Asia/Kolkata (Indian Standard Time, UTC+5:30)
 * Standard UI Date Format: DD MMM YYYY (e.g. 20 Oct 2026)
 * Standard UI Time Format: hh:mm A (e.g. 09:30 AM)
 * Standard DB Date Format: YYYY-MM-DD (e.g. 2026-10-20)
 * Standard Invoice Date Format: DD/MM/YYYY (e.g. 20/10/2026)
 */

export const CLINIC_TIMEZONE = "Asia/Kolkata";

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

/**
 * Get current Date in Asia/Kolkata
 */
export function getNowInKolkata(): Date {
  return new Date();
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata.
 * Used for database DATE columns and HTML <input type="date">.
 */
export function getTodayDbDate(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}

/**
 * Returns today's date formatted as DD MMM YYYY in Asia/Kolkata (e.g. '20 Oct 2026').
 */
export function getTodayUiDate(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: CLINIC_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date());
  } catch {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTH_NAMES_SHORT[d.getMonth()] || "Jan";
    return `${day} ${month} ${d.getFullYear()}`;
  }
}

/**
 * Returns the current time formatted as hh:mm A in Asia/Kolkata (e.g. '03:45 PM').
 */
export function getCurrentTime(): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: CLINIC_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date());
  } catch {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  }
}

/**
 * Returns full header live date string (e.g. 'Tuesday, 20 Oct 2026').
 */
export function getHeaderLiveDate(): string {
  try {
    const d = new Date();
    const dayName = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TIMEZONE, weekday: "long" }).format(d);
    const dateStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: CLINIC_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
    return `${dayName}, ${dateStr}`;
  } catch {
    return getTodayUiDate();
  }
}

/**
 * Safely parse any date string into a Date object.
 * Supports:
 * - 'YYYY-MM-DD'
 * - 'DD MMM YYYY' (e.g. '20 Oct 2026')
 * - 'DD/MM/YYYY' (e.g. '20/10/2026')
 * - Full ISO-8601 timestamps
 */
export function parseDateSafe(dateInput?: string | Date | number | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(dateInput).trim();
  if (!str || str === "—" || str === "-") return null;

  // 1. YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.slice(0, 10).split("-").map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    }
  }

  // 2. DD MMM YYYY (e.g. '20 Oct 2026' or '08 Aug 2026')
  const parts = str.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].slice(0, 3);
    const year = parseInt(parts[2], 10);
    const m = MONTH_MAP[monthStr];
    if (!isNaN(day) && m !== undefined && !isNaN(year)) {
      return new Date(Date.UTC(year, m, day, 12, 0, 0));
    }
  }

  // 3. DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const [d, m, y] = str.slice(0, 10).split("/").map(Number);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    }
  }

  // 4. Fallback native Date constructor
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a Date or date string to 'DD MMM YYYY' in Asia/Kolkata.
 * If input is missing or invalid, returns fallback (default '—').
 * Never returns a fabricated or hardcoded date!
 */
export function formatDate(input?: Date | string | number | null, fallback: string = "—"): string {
  const d = parseDateSafe(input);
  if (!d) return fallback;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: CLINIC_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTH_NAMES_SHORT[d.getMonth()] || "Jan";
    return `${day} ${month} ${d.getFullYear()}`;
  }
}

/**
 * Formats a Date or date string to 'YYYY-MM-DD' for DB columns or <input type="date">.
 */
export function formatDateForDb(input?: Date | string | null): string {
  const d = parseDateSafe(input);
  if (!d) return getTodayDbDate();

  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(d);
  } catch {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}

/**
 * Converts a UI date ('20 Oct 2026', '20/10/2026') to DB format 'YYYY-MM-DD'.
 * If empty, returns today's DB date in Asia/Kolkata.
 */
export function convertToDbDate(uiDate?: string | null): string {
  if (!uiDate || !uiDate.trim()) return getTodayDbDate();
  if (/^\d{4}-\d{2}-\d{2}$/.test(uiDate.trim())) return uiDate.trim();
  return formatDateForDb(uiDate);
}

/**
 * Converts a DB date ('2026-10-20' or ISO string) to UI display '20 Oct 2026'.
 * If empty or null, returns fallback ('—' or specified).
 * NEVER returns hardcoded '12 Aug 2026'!
 */
export function convertToUiDate(dbDate?: string | null, fallback: string = "—"): string {
  if (!dbDate || !dbDate.trim()) return fallback;
  return formatDate(dbDate, fallback);
}

/**
 * Formats date into standard DD/MM/YYYY for the official Sameeksha printed invoice.
 * Correctly parses '20 Oct 2026', '2026-10-20', ISO timestamps, etc.
 */
export function formatInvoiceDate(rawDate?: string | Date | null): string {
  const d = parseDateSafe(rawDate);
  if (!d) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: CLINIC_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date());
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: CLINIC_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(d);
  } catch {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  }
}

/**
 * Formats time: 'hh:mm A' (e.g. '09:30 AM').
 */
export function formatTime(input?: Date | string | null, fallback: string = ""): string {
  if (!input) return fallback;
  if (typeof input === "string") {
    // If it's already a clean time slot like "09:30 AM", return it
    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input.trim())) {
      const parts = input.trim().split(/[:\s]+/);
      const h = parts[0].padStart(2, "0");
      const m = parts[1];
      const ampm = parts[2].toUpperCase();
      return `${h}:${m} ${ampm}`;
    }
  }

  const d = parseDateSafe(input);
  if (!d) return fallback;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: CLINIC_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(d);
  } catch {
    return fallback;
  }
}

/**
 * Formats date and time: 'DD MMM YYYY, hh:mm A'.
 */
export function formatDateTime(input?: Date | string | null, fallback: string = "—"): string {
  const d = parseDateSafe(input);
  if (!d) return fallback;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/**
 * Gets the Monday of the current week in Asia/Kolkata for weekly appointment calendar.
 */
export function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const dbStr = formatDateForDb(d);
  const [y, m, dayNum] = dbStr.split("-").map(Number);
  const localD = new Date(y, m - 1, dayNum, 12, 0, 0);
  const day = localD.getDay();
  const diff = localD.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(y, m - 1, diff, 12, 0, 0);
}

/**
 * Checks if two dates represent the same day in Asia/Kolkata.
 */
export function isSameDayInKolkata(d1: Date | string, d2: Date | string): boolean {
  return formatDateForDb(typeof d1 === "string" ? d1 : d1) === formatDateForDb(typeof d2 === "string" ? d2 : d2);
}

/**
 * Checks if a date represents today in Asia/Kolkata.
 */
export function isTodayInKolkata(d: Date | string): boolean {
  return formatDateForDb(typeof d === "string" ? d : d) === getTodayDbDate();
}

/**
 * Checks if a date string falls between start and end Dates (inclusive).
 */
export function isDateInRange(dateStr: string | undefined | null, start: Date, end: Date): boolean {
  if (!dateStr || dateStr === "—") return false;
  const d = parseDateSafe(dateStr);
  if (!d) return false;
  return d >= start && d <= end;
}

/**
 * Cleanly format patient last visit. Returns '—' if empty or invalid.
 */
export function formatLastVisit(visitStr?: string | null): string {
  if (!visitStr || !visitStr.trim() || visitStr === "—" || visitStr.toLowerCase().includes("no visit")) {
    return "—";
  }
  return formatDate(visitStr, "—");
}

/**
 * Dynamic patient Last Visit resolver based on real database records:
 * - Checks patient's appointments (status = "Completed", "In Procedure", or "Checked In")
 * - Checks patient's treatments (stage = "Completed" or "In Progress")
 * - Validates historical patient.visit string (rejects hardcoded '12 Aug 2026' artifact for new patients)
 * - Returns '—' if patient has no completed visits or encounters.
 */
export function resolvePatientLastVisit(
  patient: { id?: string; uuid?: string; patient_id?: string; visit?: string | null; created_at?: string | null; createdAt?: string | null },
  appointments: Array<{ patientId?: string; patient_id?: string; date?: string; appointment_date?: string; status?: string }>,
  treatments: Array<{ patientId?: string; patient_id?: string; date?: string; treatment_date?: string; stage?: string; created_at?: string; patient?: string }>
): string {
  const patientUuid = patient.uuid || patient.id;
  const patientCustomId = patient.patient_id || patient.id;

  const validDbDates: string[] = [];

  // 1. Check completed appointments
  if (Array.isArray(appointments)) {
    for (const a of appointments) {
      const match =
        (patientUuid && (a.patient_id === patientUuid || a.patientId === patientUuid)) ||
        (patientCustomId && (a.patient_id === patientCustomId || a.patientId === patientCustomId));

      if (match) {
        const isEncounter =
          a.status === "Completed" ||
          a.status === "In Procedure" ||
          a.status === "Checked In";

        if (isEncounter) {
          const rawDate = a.appointment_date || a.date;
          if (rawDate) {
            const dbDate = convertToDbDate(rawDate);
            if (dbDate && /^\d{4}-\d{2}-\d{2}$/.test(dbDate)) {
              validDbDates.push(dbDate);
            }
          }
        }
      }
    }
  }

  // 2. Check completed / active treatments
  if (Array.isArray(treatments)) {
    for (const t of treatments) {
      const match =
        (patientUuid && (t.patient_id === patientUuid || t.patientId === patientUuid)) ||
        (patientCustomId && (t.patient_id === patientCustomId || t.patientId === patientCustomId || (t as any).patient === patientCustomId));

      if (match) {
        const isEncounter = t.stage === "Completed" || t.stage === "In Progress";
        if (isEncounter) {
          const rawDate = t.treatment_date || t.date || t.created_at;
          if (rawDate) {
            const dbDate = convertToDbDate(rawDate);
            if (dbDate && /^\d{4}-\d{2}-\d{2}$/.test(dbDate)) {
              validDbDates.push(dbDate);
            }
          }
        }
      }
    }
  }

  // 3. Check legacy visit field on patient record
  const rawVisit = (patient.visit || "").trim();
  if (rawVisit && rawVisit !== "—" && rawVisit !== "-" && !rawVisit.toLowerCase().includes("no visit")) {
    const isAugust12Artifact = rawVisit === "12 Aug 2026";
    const patientCreatedAt = patient.created_at || patient.createdAt;

    // Only accept '12 Aug 2026' if the patient was created on or before Aug 12, 2026,
    // otherwise it was an artifact of the hardcoded default on registration
    let acceptVisit = true;
    if (isAugust12Artifact) {
      if (patientCreatedAt) {
        const createdDate = parseDateSafe(patientCreatedAt);
        if (createdDate && createdDate > new Date(2026, 7, 13)) {
          acceptVisit = false;
        }
      }
    }

    if (acceptVisit) {
      const dbDate = convertToDbDate(rawVisit);
      if (dbDate && /^\d{4}-\d{2}-\d{2}$/.test(dbDate)) {
        validDbDates.push(dbDate);
      }
    }
  }

  // If we found any actual encounters, take the latest one
  if (validDbDates.length > 0) {
    validDbDates.sort().reverse();
    return convertToUiDate(validDbDates[0], "—");
  }

  return "—";
}

