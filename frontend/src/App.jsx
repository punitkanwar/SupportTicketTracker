import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import CreateTicketPage from './pages/CreateTicketPage.jsx';
import TicketDetailsPage from './pages/TicketDetailsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />


      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/new" element={<CreateTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
