/**
 * Date utility functions for MeuCargueiro
 *
 * These functions provide timezone-aware date parsing and formatting,
 * essential for serializing Prisma Date fields across timezones.
 *
 * USAGE IN ZOD SCHEMAS:
 * ======================
 * When building schemas for date fields (fretes, maintenance records, fuel logs),
 * use `parseDate()` in Zod transforms to ensure consistent handling:
 *
 * Example - Frete schema:
 * ────────────────────────
 *   const criarFreteSchema = z.object({
 *     data: z.string().pipe(
 *       z.coerce.date()
 *         .transform(parseDate)  // ← Normalize date input
 *         .refine(d => d !== null, "Data invalida")
 *     ),
 *     // ...
 *   });
 *
 * Example - Maintenance record:
 * ─────────────────────────────
 *   const manutencaoSchema = z.object({
 *     data: z.string().transform(parseDate).refine(d => d !== null),
 *     proxima: z.string().optional().transform(d => d ? parseDate(d) : null),
 *   });
 *
 * Example - Server Component serialization:
 * ─────────────────────────────────────────
 *   // When fetching dates from Prisma in RSC, format before passing to client:
 *   const fretes = await db.frete.findMany({ where: { organizacaoId } });
 *   return fretes.map(f => ({
 *     ...f,
 *     data: formatDate(f.data),      // → "15/01/2024"
 *     criadoEm: formatDateTime(f.criadoEm), // → "15/01/2024, 10:30"
 *   }));
 *
 * TIMEZONE HANDLING:
 * ==================
 * All formatting functions apply America/Sao_Paulo timezone (UTC-3).
 * This ensures consistent display regardless of server/client location.
 * Use `toPlainDateString()` when serializing @db.Date to JSON (no time info).
 */

const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

export function getNow(): Date {
  return new Date();
}

export function isValidDate(date: Date | unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * Parses a plain ISO date string (YYYY-MM-DD) in a timezone-safe way.
 *
 * JavaScript treats plain ISO dates as UTC, which can shift the day when
 * formatted in a local timezone. We use a fixed midday UTC time to avoid
 * the common "off by one day" issue.
 *
 * @param value Plain date string in YYYY-MM-DD format
 * @returns Date anchored to noontime UTC (immune to timezone offset)
 * @example
 * parsePlainIsoDate("2024-01-15"); // Date(2024-01-15T12:00:00.000Z)
 */
export function parsePlainIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map((v) => Number(v));
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/**
 * Parses a date input (ISO string, plain date string, or Date instance) and
 * returns a Date instance or null if invalid.
 */
export function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoPlainMatch = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
  if (isoPlainMatch) {
    return parsePlainIsoDate(trimmed);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("/").map((v) => Number(v));
    const date = new Date(year, month - 1, day);
    return isValidDate(date) ? date : null;
  }

  const date = new Date(trimmed);
  return isValidDate(date) ? date : null;
}

/**
 * Formats a date/datetime value as a date-only string (DD/MM/YYYY) in pt-BR locale.
 *
 * Input can be:
 * - Plain ISO date string (YYYY-MM-DD) — for @db.Date fields
 * - Full ISO datetime string (ISO 8601) — for DateTime fields
 * - Date instance
 *
 * The function applies America/Sao_Paulo timezone for display.
 * Returns "-" for null, undefined, or invalid inputs.
 *
 * @param value Date, date string, or ISO datetime string
 * @returns Formatted date in PT-BR (DD/MM/YYYY) or "-" if invalid
 * @example
 * formatDate("2024-01-15"); // "15/01/2024"
 * formatDate(new Date("2024-01-15T10:30:00Z")); // "15/01/2024"
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";

  const date = parseDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

/**
 * Formats a datetime value as a date and time string (DD/MM/YYYY HH:MM) in pt-BR locale.
 *
 * Input can be:
 * - Full ISO datetime string (ISO 8601)
 * - Date instance
 *
 * Always applies America/Sao_Paulo timezone (UTC-3).
 * Returns "-" for null, undefined, or invalid inputs.
 *
 * @param value Date or ISO datetime string
 * @returns Formatted datetime in PT-BR (DD/MM/YYYY HH:MM) or "-" if invalid
 * @example
 * formatDateTime(new Date("2024-01-15T18:30:00Z")); // "15/01/2024 15:30" (adjusted to BRT)
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";

  const date = parseDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

export function toIsoString(value: Date | string): string {
  const date = parseDate(value);
  if (!date) throw new Error("Invalid date");
  return date.toISOString();
}

/**
 * Converts a Date to a plain ISO date string (YYYY-MM-DD).
 * Useful for Server Components serializing @db.Date fields.
 *
 * @param date Date instance to convert
 * @returns Plain ISO date string in YYYY-MM-DD format
 * @example
 * const dateObj = new Date(Date.UTC(2024, 0, 15));
 * toPlainDateString(dateObj); // "2024-01-15"
 */
export function toPlainDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
