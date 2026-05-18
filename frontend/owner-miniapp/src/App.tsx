import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './telegram/TelegramProvider';
import { DashboardPage } from './pages/DashboardPage';
import { BotOverviewPage } from './pages/BotOverviewPage';
import { BookingsPage } from './pages/BookingsPage';
import { CustomersPage } from './pages/CustomersPage';
import { Layout } from './components/Layout';

/**
 * App — root component with routing.
 *
 * Routes:
 * /          → Dashboard (bots list, stats)
 * /bots/:id  → Bot overview
 * /bots/:id/bookings → Booking list
 * /bots/:id/customers → Customer list
 */
export default function App() {
  return (
    <TelegramProvider>
      <BrowserRouter basename="/app">
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bots/:id" element={<BotOverviewPage />} />
            <Route path="/bots/:id/bookings" element={<BookingsPage />} />
            <Route path="/bots/:id/customers" element={<CustomersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TelegramProvider>
  );
}
