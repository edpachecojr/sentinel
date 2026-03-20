"use client";

export default function PrivateLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Main large spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-800 dark:border-t-brand-500"></div>
        {/* Delayed pulsing center */}
        <div className="absolute h-8 w-8 animate-pulse rounded-full bg-brand-500/20"></div>
      </div>
      
      <div className="space-y-3 w-full max-w-xs px-4">
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/3 rounded-full"></div>
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500 text-center animate-pulse">
          Carregando informações...
        </p>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
