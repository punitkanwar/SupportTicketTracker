import { Sidebar } from './Sidebar.jsx';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col bg-[#050505]">
        <Outlet />
      </main>
    </div>
  );
}
