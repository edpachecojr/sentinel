"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

type StepDisplayNameProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function StepDisplayName({ value, onChange, error }: StepDisplayNameProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="onboarding-display-name" className="text-sm font-semibold text-gray-900 dark:text-white">
          Como você quer ser chamado?
        </Label>
        <Input
          id="onboarding-display-name"
          type="text"
          placeholder="Ex: João Silva"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-red-500 animate-in fade-in duration-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
