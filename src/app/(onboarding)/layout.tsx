import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl dark:from-blue-900/20 dark:to-indigo-900/20" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 blur-3xl dark:from-indigo-900/20 dark:to-blue-900/20" />
      </div>

      {/* Centered content container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
