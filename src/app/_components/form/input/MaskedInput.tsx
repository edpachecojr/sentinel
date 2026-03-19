"use client";

import React from "react";
import { IMaskInput } from "react-imask";

interface MaskedInputProps {
  /**
   * Máscara IMask. Exemplos:
   *  - string simples: "000.000.000-00"
   *  - array de máscaras dinâmicas: [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }]
   */
  mask: string | readonly { mask: string }[];
  id?: string;
  placeholder?: string;
  /** Valor atual no formato mascarado (ex.: "529.982.247-25"). */
  value?: string;
  /**
   * Disparado quando o valor mascarado muda e é aceito pelo IMask.
   * Recebe o valor no formato mascarado (com separadores visuais).
   */
  onAccept?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  id,
  placeholder,
  value,
  onAccept,
  onBlur,
  disabled = false,
  error = false,
  hint,
}) => {
  // Classes espelhadas do InputField.tsx — manter em sincronia manualmente.
  let inputClasses =
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm " +
    "shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 " +
    "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

  if (disabled) {
    inputClasses +=
      " text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  } else if (error) {
    inputClasses +=
      " text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500";
  } else {
    inputClasses +=
      " bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 " +
      "focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 " +
      "dark:text-white/90 dark:focus:border-brand-800";
  }

  return (
    <div className="relative">
      <IMaskInput
        mask={mask as string}
        id={id}
        placeholder={placeholder}
        value={value ?? ""}
        onAccept={(val) => onAccept?.(val as string)}
        onBlur={onBlur}
        disabled={disabled}
        className={inputClasses}
      />
      {hint && (
        <p className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default MaskedInput;
