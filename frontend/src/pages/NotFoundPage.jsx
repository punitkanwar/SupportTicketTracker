import { Link } from 'react-router-dom';
import { Home, Ticket } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-sm">
        <div className="text-[72px] font-bold font-mono tracking-tighter text-[#222222] leading-none mb-2 select-none">
          404
        </div>
        <h1 className="text-base font-semibold text-[#F5F5F5] mb-1.5">Page not found</h1>
        <p className="text-xs text-[#707070] mb-6 leading-relaxed">
          The requested route doesn't exist or has been relocated.
        </p>
        <div className="flex items-center justify-center gap-2.5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#FFFFFF] hover:bg-[#EAEAEA] text-[#090909] rounded-md transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium border border-[#242424] bg-[#121212] text-[#A1A1A1] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-md transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" /> All Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
