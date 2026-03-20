/**
 * Formata um valor numérico em moeda BRL (Real Brasileiro).
 *
 * Entrada pode ser:
 * - Número JavaScript (number)
 * - Prisma Decimal (tem método toNumber())
 * - null/undefined (retorna "-")
 *
 * Sempre usa locale pt-BR com símbolo BRL (R$).
 *
 * @param value Valor numérico, tipo com método toNumber(), ou null/undefined
 * @returns String formatada em BRL (ex: "R$ 1.500,00") ou "-" se null/undefined
 * @example
 * formatBRL(1500);           // "R$ 1.500,00"
 * formatBRL(0.5);            // "R$ 0,50"
 * formatBRL(prismaDec);      // "R$ 1.234,56" (Decimal com toNumber())
 * formatBRL(null);           // "-"
 */
export function formatBRL(
  value: number | { toNumber(): number } | null | undefined
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  // Converte objetos com toNumber() (como Prisma.Decimal) para number
  const numericValue =
    typeof value === "number" ? value : value.toNumber();

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}
