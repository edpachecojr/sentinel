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
