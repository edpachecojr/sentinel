"use client";

type ProgressIndicatorProps = {
  currentStep: 1 | 2;
};

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const stepLabels = [
    { number: 1, label: "Seu Nome" },
    { number: 2, label: "Sua Organização" },
  ];

  return (
    <div className="mb-10 space-y-2">
      {/* Visual progress bar with gradient */}
      <div className="flex items-center gap-4">
        {stepLabels.map((step, idx) => {
          const active = currentStep >= step.number;
          const isCurrentStep = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-1 items-center gap-3">
              {/* Step circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  } ${
                    isCurrentStep ? "ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-gray-900" : ""
                  }`}
                >
                  {step.number}
                </div>
              </div>

              {/* Progress line */}
              {idx < stepLabels.length - 1 && (
                <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentStep > step.number
                        ? "w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "w-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between">
        {stepLabels.map((step) => (
          <div key={step.number} className="text-xs font-medium">
            <p
              className={`transition-colors duration-300 ${
                currentStep >= step.number
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
