import { Ticket, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center mb-3.5">
        <Ticket className="w-5 h-5 text-[#707070]" />
      </div>
      <p className="text-sm font-medium text-[#F5F5F5]">{title}</p>
      <p className="text-xs text-[#A1A1A1] mt-1 max-w-sm leading-relaxed">{description}</p>
      {action && (
        <Link
          to="/tickets/new"
          className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#FFFFFF] text-[#090909] hover:bg-[#EAEAEA] rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {action}
        </Link>
      )}
    </div>
  );
}
