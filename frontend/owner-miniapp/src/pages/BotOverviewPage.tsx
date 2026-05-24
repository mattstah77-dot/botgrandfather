import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

/**
 * BotOverviewPage — template-agnostic bot overview.
 *
 * CAPABILITY NEUTRALITY:
 * This page displays universal metrics (customers, interactions, events).
 * Template-specific data comes through capability widgets, not hardcoded.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Overview does NOT know about "leads" or "bookings".
 * It displays universal metrics + capability-provided widgets.
 */

interface BotOverviewData {
  botId: string;
  template: string;
  createdAt: string;
  stats: {
    customers: number;
    customersByStatus: Record<string, number>;
    interactions: number;
    events: number;
  };
}

interface BookingPreview {
  id: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: string;
  username: string | null;
}

export function BotOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [data, setData] = useState<BotOverviewData | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setInitData(initData);
    if (!initData || !id) {
      setLoading(false);
      return;
    }

    api.getBotOverview(id)
      .then((res) => {
        setData(res);
        setLoading(false);
        
        // Fetch upcoming bookings for booking template
        if (res.template === 'booking') {
          fetchUpcomingBookings(id);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData, id]);

  async function fetchUpcomingBookings(botId: string) {
    try {
      const res = await api.getCapabilityData(botId, 'bookings', 1, 5);
      // Filter to pending/confirmed bookings and sort by date
      const upcoming = res.items
        .filter((item: any) => item.status === 'pending' || item.status === 'confirmed')
        .slice(0, 3) as BookingPreview[];
      setUpcomingBookings(upcoming);
    } catch (err) {
      // Silently fail — upcoming bookings are optional
      console.error('Failed to fetch upcoming bookings:', err);
    }
  }

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.BackButton.show();
    const goBack = () => navigate(-1);
    tg.BackButton.onClick(goBack);

    return () => {
      tg.BackButton.offClick(goBack);
      tg.BackButton.hide();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: {error || 'Not found'}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Bot Overview</h1>
        <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
          {data.template}
        </p>
      </header>

      {/* Universal metrics — capability-neutral */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Customers" value={data.stats.customers} />
        <StatCard label="Interactions" value={data.stats.interactions} />
        <StatCard label="Events" value={data.stats.events} />
        <StatCard
          label="Converted"
          value={data.stats.customersByStatus?.converted || 0}
        />
      </div>

      {/* Capability widgets — template-specific data rendered generically */}
      {renderCapabilityWidgets(data.template, id!)}

      {/* Upcoming bookings preview — booking capability only */}
      {data.template === 'booking' && upcomingBookings.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Upcoming</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => navigate(`/bots/${id}/bookings/${booking.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--tg-theme-secondary-bg-color, #fff)',
                  border: '1px solid var(--tg-theme-hint-color, #ddd)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--tg-theme-text-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{booking.serviceName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                    {booking.date} at {booking.timeSlot}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    borderRadius: '10px',
                    background: booking.status === 'confirmed' ? '#27ae60' : '#f39c12',
                    color: '#fff',
                    textTransform: 'capitalize',
                  }}
                >
                  {booking.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions — capability-aware */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Actions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ActionButton label="👥 View Customers" onClick={() => navigate(`/bots/${id}/customers`)} />
        {renderCapabilityActions(data.template, id!, navigate)}
      </div>
    </div>
  );
}

import type { CapabilityAction } from '../types/operational-contracts';

/**
 * Capability Action Descriptors — lightweight explicit metadata.
 *
 * WHY explicit descriptors (not a framework):
 * - Simple object arrays, no recursive schemas
 * - Composable at call site
 * - Easy to extend when new templates need actions
 * - No runtime registry, no dynamic loading
 *
 * WHEN to abstract further:
 * - After 3+ templates prove identical action patterns.
 * - Currently: 2 templates, explicit is correct.
 */
const CAPABILITY_ACTIONS: Record<string, CapabilityAction[]> = {
  booking: [
    { id: 'view-bookings', label: 'View Bookings', type: 'navigate', route: '/capabilities/bookings', icon: '📅' },
    { id: 'view-calendar', label: 'View Calendar', type: 'navigate', route: '/capabilities/calendar', icon: '🗓️' },
  ],
  'lead-funnel': [
    { id: 'view-leads', label: 'View Leads', type: 'navigate', route: '/capabilities/leads', icon: '📊' },
  ],
};

/**
 * Render capability-specific widgets based on template.
 *
 * NOTE: This is transitional. When capability widgets come from
 * backend (OwnerModuleRegistry), this becomes generic rendering.
 */
function renderCapabilityWidgets(template: string, _botId: string) {
  switch (template) {
    case 'booking':
      return (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Bookings</h2>
          <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
            Manage appointments and scheduling for this bot.
          </p>
        </div>
      );
    case 'lead-funnel':
      return (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Leads</h2>
          <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
            View leads captured by this bot.
          </p>
        </div>
      );
    default:
      return null;
  }
}

/**
 * Render capability-specific actions from explicit descriptors.
 */
function renderCapabilityActions(template: string, botId: string, navigate: ReturnType<typeof useNavigate>) {
  const actions = CAPABILITY_ACTIONS[template];
  if (!actions) return null;

  return (
    <>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          label={`${action.icon || ''} ${action.label}`}
          onClick={() => navigate(`/bots/${botId}${action.route}`)}
        />
      ))}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--tg-theme-secondary-bg-color, #fff)',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid var(--tg-theme-hint-color, #ddd)',
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>{label}</div>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 16px',
        background: 'var(--tg-theme-button-color, #2481cc)',
        color: 'var(--tg-theme-button-text-color, #fff)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  );
}
