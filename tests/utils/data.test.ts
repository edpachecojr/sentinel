import { describe, it, expect } from "vitest";
import {
  isValidDate,
  parsePlainIsoDate,
  parseDate,
  formatDate,
  formatDateTime,
  getNow,
  toIsoString,
  toPlainDateString,
} from "@/utils/data";

describe("data utilities", () => {
  describe("isValidDate()", () => {
    it("deve retornar true para Date válido", () => {
      const date = new Date();
      expect(isValidDate(date)).toBe(true);
    });

    it("deve retornar false para string", () => {
      expect(isValidDate("2024-01-15")).toBe(false);
    });

    it("deve retornar false para null", () => {
      expect(isValidDate(null)).toBe(false);
    });

    it("deve retornar false para undefined", () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it("deve retornar false para Date inválido (NaN)", () => {
      const invalidDate = new Date(Number.NaN);
      expect(isValidDate(invalidDate)).toBe(false);
    });

    it("deve retornar false para número", () => {
      expect(isValidDate(20240115)).toBe(false);
    });
  });

  describe("parsePlainIsoDate()", () => {
    it("deve converter YYYY-MM-DD para UTC noon para evitar off-by-one timezone", () => {
      const result = parsePlainIsoDate("2024-01-15");
      expect(result.toISOString()).toBe("2024-01-15T12:00:00.000Z");
    });

    it("deve aceitar diferentes datas", () => {
      const result = parsePlainIsoDate("2024-12-31");
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(11); // 0-indexed
      expect(result.getUTCDate()).toBe(31);
      expect(result.getUTCHours()).toBe(12);
    });
  });

  describe("parseDate()", () => {
    it("deve retornar o mesmo Date quando recebe Date válido", () => {
      const date = new Date("2024-01-15T10:00:00Z");
      const result = parseDate(date);
      expect(result).toEqual(date);
    });

    it("deve retornar null para Date inválido", () => {
      const invalidDate = new Date(Number.NaN);
      expect(parseDate(invalidDate)).toBeNull();
    });

    it("deve parsear ISO string (full datetime)", () => {
      const result = parseDate("2024-01-15T10:30:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toContain("2024-01-15");
    });

    it("deve parsear plain ISO date (YYYY-MM-DD)", () => {
      const result = parseDate("2024-01-15");
      expect(result?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
    });

    it("deve parsear DD/MM/YYYY format", () => {
      const result = parseDate("15/01/2024");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January (0-indexed)
      expect(result?.getDate()).toBe(15);
    });

    it("deve retornar null para string vazia", () => {
      expect(parseDate("")).toBeNull();
    });

    it("deve retornar null para whitespace-only string", () => {
      expect(parseDate("   ")).toBeNull();
    });

    it("deve retornar null para tipo não-string/Date", () => {
      expect(parseDate(12345)).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate({})).toBeNull();
    });
  });

  describe("formatDate()", () => {
    it("deve formatar Date como DD/MM/YYYY em pt-BR", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      expect(formatDate(date)).toBe("15/01/2024");
    });

    it("deve formatar ISO string como DD/MM/YYYY", () => {
      expect(formatDate("2024-01-15T10:30:00Z")).toBe("15/01/2024");
    });

    it("deve formatar plain ISO date (YYYY-MM-DD) como DD/MM/YYYY", () => {
      expect(formatDate("2024-01-15")).toBe("15/01/2024");
    });

    it("deve retornar '-' para null", () => {
      expect(formatDate(null)).toBe("-");
    });

    it("deve retornar '-' para undefined", () => {
      expect(formatDate(undefined)).toBe("-");
    });

    it("deve retornar '-' para string vazia", () => {
      expect(formatDate("")).toBe("-");
    });

    it("deve retornar '-' para data inválida", () => {
      expect(formatDate("data-invalida")).toBe("-");
    });

    it("deve aplicar timezone America/Sao_Paulo", () => {
      // UTC 2024-01-15 18:00:00 = BRT 2024-01-15 15:00:00 (UTC-3)
      const date = new Date("2024-01-15T18:00:00Z");
      const formatted = formatDate(date);
      expect(formatted).toBe("15/01/2024");
    });
  });

  describe("formatDateTime()", () => {
    it("deve formatar Date como DD/MM/YYYY e HH:MM em pt-BR", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const formatted = formatDateTime(date);
      // Intl.DateTimeFormat em pt-BR usa vírgula como separador
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
      expect(formatted).toContain("15/01/2024");
    });

    it("deve retornar '-' para null", () => {
      expect(formatDateTime(null)).toBe("-");
    });

    it("deve retornar '-' para undefined", () => {
      expect(formatDateTime(undefined)).toBe("-");
    });

    it("deve retornar '-' para string vazia", () => {
      expect(formatDateTime("")).toBe("-");
    });

    it("deve retornar '-' para data inválida", () => {
      expect(formatDateTime("data-invalida")).toBe("-");
    });

    it("deve incluir hora e minuto", () => {
      const date = new Date("2024-01-15T15:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/\d{2}:\d{2}$/);
    });

    it("deve aplicar timezone America/Sao_Paulo", () => {
      // UTC 2024-01-15 18:30:00 = BRT 2024-01-15 15:30:00
      const date = new Date("2024-01-15T18:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toContain("15/01/2024");
    });
  });

  describe("getNow()", () => {
    it("deve retornar uma instância de Date", () => {
      const now = getNow();
      expect(now).toBeInstanceOf(Date);
    });

    it("deve retornar um Date válido", () => {
      const now = getNow();
      expect(isValidDate(now)).toBe(true);
    });

    it("deve retornar tempo próximo ao atual (dentro de 1 segundo)", () => {
      const now = getNow();
      const diff = Math.abs(now.getTime() - new Date().getTime());
      expect(diff).toBeLessThan(1000);
    });
  });

  describe("toIsoString()", () => {
    it("deve converter Date para ISO string", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = toIsoString(date);
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("deve converter ISO string para ISO string (idempotente)", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      const result = toIsoString(isoString);
      expect(result).toBe(isoString);
    });

    it("deve converter DD/MM/YYYY para ISO string", () => {
      const result = toIsoString("15/01/2024");
      expect(result).toContain("2024-01-15");
    });

    it("deve lançar erro para data inválida", () => {
      expect(() => toIsoString("data-invalida")).toThrow("Invalid date");
    });

    it("deve lançar erro para null", () => {
      expect(() => toIsoString(null as any)).toThrow("Invalid date");
    });
  });

  describe("toPlainDateString()", () => {
    it("deve converter Date para YYYY-MM-DD", () => {
      const date = new Date(Date.UTC(2024, 0, 15, 12, 30, 0)); // January = 0
      const result = toPlainDateString(date);
      expect(result).toBe("2024-01-15");
    });

    it("deve converter diferentes datas corretamente", () => {
      const date = new Date(Date.UTC(2024, 11, 31, 23, 59, 59)); // December = 11
      const result = toPlainDateString(date);
      expect(result).toBe("2024-12-31");
    });

    it("deve retornar string em formato YYYY-MM-DD", () => {
      const date = new Date("2024-06-15T14:00:00Z");
      const result = toPlainDateString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
