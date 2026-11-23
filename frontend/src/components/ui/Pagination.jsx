import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E1E] bg-[#0E0E0E]">
      <span className="text-xs text-[#707070]">
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} tickets`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex items-center justify-center w-7 h-7 rounded border border-[#242424] bg-[#141414] text-[#A1A1A1] hover:bg-[#202020] hover:text-[#FFFFFF] hover:border-[#383838] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2.5 py-1 text-xs font-medium text-[#A1A1A1] tabular-nums">
          {page} <span className="text-[#555555]">/</span> {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex items-center justify-center w-7 h-7 rounded border border-[#242424] bg-[#141414] text-[#A1A1A1] hover:bg-[#202020] hover:text-[#FFFFFF] hover:border-[#383838] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
