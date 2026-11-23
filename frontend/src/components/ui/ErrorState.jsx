import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2E2E2E] flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-[#E0E0E0]" />
      </div>
      <p className="text-sm font-medium text-[#F5F5F5]">Unable to load data</p>
      <p className="text-xs text-[#A1A1A1] mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#D4D4D4] bg-[#161616] border border-[#2A2A2A] rounded-md hover:bg-[#202020] hover:text-[#FFFFFF] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
