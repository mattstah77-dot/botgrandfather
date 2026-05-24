import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './telegram/TelegramProvider';
import { DashboardPage } from './pages/DashboardPage';
import { BotOverviewPage } from './pages/BotOverviewPage';
import { CapabilityPage } from './pages/CapabilityPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { Layout } from './components/Layout';

/**
 * App — root component with capability-aware routing.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Routes are capability-aware, not template-hardcoded.
 * The shell is template-neutral. Capability-specific routes
 * use explicit namespace to avoid conflicts with universal routes.
 *
 * CAPABILITY ROUTING:
 * /bots/:botId/capabilities/:capability → Generic capability viewer
 *
 * UNIVERSAL ROUTES (template-agnostic):
 * /bots/:id → Bot overview
 * /bots/:id/customers → Customers
 *
 * NOT:
 * /bots/:botId/bookings → Hardcoded booking route
 * /bots/:botId/leads → Hardcoded lead route
 *
 * TRANSITIONAL NOTE:
 * Old routes preserved as redirects for backward compatibility.
 */
export default function App() {
  return (
    <TelegramProvider>
      <BrowserRouter basename="/app">
        <Layout>
          <Routes>
            {/* Universal routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bots/:id" element={<BotOverviewPage />} />
            <Route path="/bots/:id/customers" element={<CustomersPage />} />

            {/* Generic capability route — explicit namespace */}
            <Route path="/bots/:botId/capabilities/:capability" element={<CapabilityPage />} />

            {/* Capability-specific detail routes — EXPLICIT, not dynamic */}
            <Route path="/bots/:botId/bookings/:bookingId" element={<BookingDetailPage />} />

            {/* Legacy redirects (transitional) */}
            <Route path="/bots/:id/bookings" element={<Navigate to="/bots/:id/capabilities/booking" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TelegramProvider>
  );
}
