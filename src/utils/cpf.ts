/**
 * CPF (Cadastro de Pessoas Físicas) validation utilities for Falcon
 *
 * USAGE IN ZOD SCHEMAS:
 * ======================
 * When building schemas for CPF fields (motorista/usuário information),
 * use `validateCPF()` in Zod refinements:
 *
 * Example - User CPF registration:
 * ─────────────────────────────────
 *   const usuarioCPFSchema = z.object({
 *     email: z.string().email(),
 *     cpf: z.string()
 *       .min(1, "CPF obrigatorio")
 *       .refine(validateCPF, "CPF invalido"),
 *   });
 *
 * Example - With custom error message:
 * ────────────────────────────────────
 *   const usuarioSchema = z.object({
 *     cpf: z.string().refine(
 *       (val) => validateCPF(val),
 *       { message: "CPF deve ter 11 digitos válidos (ex: 111.444.777-35)" }
 *     ),
 *   });
 *
 * FEATURES:
 * =========
 * - Accepts both formatted (111.444.777-35) and unformatted (11144477735) CPF
 * - Automatically rejects known invalid CPFs (all same digits: 00000000000, 11111111111, etc)
 * - Validates check digits using official CPF algorithm
 * - Only requires string input (no type coercion needed)
 */

const CPF_LENGTH = 11;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isRepeatedDigits(value: string) {
  return /^(\d)\1{10}$/.test(value);
}

function calculateCheckDigit(cpf: string, factor: number) {
  let total = 0;

  for (let index = 0; index < factor - 1; index += 1) {
    total += Number(cpf[index]) * (factor - index);
  }

  const remainder = (total * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function validateCPF(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== CPF_LENGTH) return false;
  if (isRepeatedDigits(cpf)) return false;

  const firstDigit = calculateCheckDigit(cpf, 10);
  const secondDigit = calculateCheckDigit(cpf, 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}
