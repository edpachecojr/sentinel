"use client";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

type StepOrganizationProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function StepOrganization({ value, onChange, error }: StepOrganizationProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="onboarding-org-name" className="text-sm font-semibold text-gray-900 dark:text-white">
          Nome da sua organização
        </Label>
        <Input
          id="onboarding-org-name"
          type="text"
          placeholder="Ex: Clínica Saúde Plus"
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
