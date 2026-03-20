import { describe, it, expect } from "vitest";
import { formatBRL } from "@/utils/moeda";

describe("formatBRL()", () => {
  it("deve formatar número inteiro em BRL", () => {
    const resultado = formatBRL(1500);
    // O Intl.NumberFormat usa espaço não-quebrável (U+00A0)
    expect(resultado).toBe("R$\u00A01.500,00");
  });

  it("deve formatar valor com centavos", () => {
    const resultado = formatBRL(0.5);
    expect(resultado).toBe("R$\u00A00,50");
  });

  it("deve formatar valor negativo", () => {
    const resultado = formatBRL(-1500);
    expect(resultado).toBe("-R$\u00A01.500,00");
  });

  it("deve formatar zero", () => {
    const resultado = formatBRL(0);
    expect(resultado).toBe("R$\u00A00,00");
  });

  it("deve retornar '-' para null ou undefined", () => {
    expect(formatBRL(null as any)).toBe("-");
    expect(formatBRL(undefined as any)).toBe("-");
  });

  it("deve formatar valor pequeno (menor que 1)", () => {
    const resultado = formatBRL(0.01);
    expect(resultado).toBe("R$\u00A00,01");
  });

  it("deve formatar valor grande com múltiplos milhares", () => {
    const resultado = formatBRL(1234567.89);
    expect(resultado).toBe("R$\u00A01.234.567,89");
  });
});
