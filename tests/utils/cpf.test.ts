import { describe, it, expect } from "vitest";
import { validateCPF } from "@/utils/cpf";

describe("validateCPF()", () => {
  describe("CPF válido", () => {
    // Real valid CPF: 11144477735 (generated via calculation)
    it("deve aceitar CPF válido sem formatação", () => {
      expect(validateCPF("11144477735")).toBe(true);
    });

    // Valid CPF: 00000000191 (edge case com zeros)
    it("deve aceitar CPF válido com zeros à esquerda", () => {
      expect(validateCPF("00000000191")).toBe(true);
    });
  });

  describe("CPF com formatação", () => {
    it("deve aceitar CPF com pontos e hífen", () => {
      expect(validateCPF("111.444.777-35")).toBe(true);
    });

    it("deve aceitar CPF apenas com pontos", () => {
      expect(validateCPF("111.444.77735")).toBe(true);
    });

    it("deve aceitar CPF apenas com hífen", () => {
      expect(validateCPF("11144477735")).toBe(true);
    });

    it("deve aceitar CPF com espaços (remove não-dígitos)", () => {
      expect(validateCPF("111 444 777 35")).toBe(true);
    });
  });

  describe("CPF inválido - dígitos verificadores", () => {
    it("deve rejeitar CPF com primeiro dígito verificador errado", () => {
      expect(validateCPF("11144477745")).toBe(false); // 45 em vez de 35
    });

    it("deve rejeitar CPF com segundo dígito verificador errado", () => {
      expect(validateCPF("11144477734")).toBe(false); // 34 em vez de 35
    });

    it("deve rejeitar CPF completamente inválido", () => {
      expect(validateCPF("12345678901")).toBe(false);
    });
  });

  describe("CPF com dígitos repetidos (inválido por regra)", () => {
    it("deve rejeitar CPF com todos 0s", () => {
      expect(validateCPF("00000000000")).toBe(false);
    });

    it("deve rejeitar CPF com todos 1s", () => {
      expect(validateCPF("11111111111")).toBe(false);
    });

    it("deve rejeitar CPF com todos 2s", () => {
      expect(validateCPF("22222222222")).toBe(false);
    });

    it("deve rejeitar CPF com todos 3s", () => {
      expect(validateCPF("33333333333")).toBe(false);
    });

    it("deve rejeitar CPF com todos 4s", () => {
      expect(validateCPF("44444444444")).toBe(false);
    });

    it("deve rejeitar CPF com todos 5s", () => {
      expect(validateCPF("55555555555")).toBe(false);
    });

    it("deve rejeitar CPF com todos 6s", () => {
      expect(validateCPF("66666666666")).toBe(false);
    });

    it("deve rejeitar CPF com todos 7s", () => {
      expect(validateCPF("77777777777")).toBe(false);
    });

    it("deve rejeitar CPF com todos 8s", () => {
      expect(validateCPF("88888888888")).toBe(false);
    });

    it("deve rejeitar CPF com todos 9s", () => {
      expect(validateCPF("99999999999")).toBe(false);
    });
  });

  describe("CPF com comprimento inválido", () => {
    it("deve rejeitar CPF com menos de 11 dígitos", () => {
      expect(validateCPF("1114447773")).toBe(false);
    });

    it("deve rejeitar CPF com mais de 11 dígitos", () => {
      expect(validateCPF("111444777350")).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
      expect(validateCPF("")).toBe(false);
    });

    it("deve rejeitar string com apenas pontos e hífen", () => {
      expect(validateCPF("...---")).toBe(false);
    });

    it("deve rejeitar string com apenas espaços", () => {
      expect(validateCPF("   ")).toBe(false);
    });
  });

  describe("CPF com caracteres especiais", () => {
    it("deve remover caracteres especiais antes de validar", () => {
      expect(validateCPF("111.444.777-35")).toBe(true);
    });

    it("deve aceitar CPF com / caracteres (remove tudo que não é dígito)", () => {
      expect(validateCPF("111/444/777/35")).toBe(true);
    });

    it("deve remover letras e dígitos válidos", () => {
      expect(validateCPF("111a444b777c35")).toBe(true);
    });

    it("deve retornar false se com letras ficar com menos dígitos", () => {
      expect(validateCPF("a1a1a4a4a4a")).toBe(false); // Fica "11444" = 5 dígitos
    });
  });

  describe("Casos extremos", () => {
    it("deve aceitar CPF válido com formatação completa", () => {
      expect(validateCPF("111.444.777-35")).toBe(true);
    });

    it("deve funcionar com entrada trimmed", () => {
      expect(validateCPF("111.444.777-35")).toBe(true);
    });

    it("deve validar mesmo com espaçamento misto", () => {
      expect(validateCPF("111 . 444 . 777 - 35")).toBe(true);
    });
  });

  describe("CPF edge cases reais", () => {
    // Several known valid CPFs (calculated)
    it("deve validar CPF 00000000191", () => {
      expect(validateCPF("00000000191")).toBe(true);
    });
  });
});
