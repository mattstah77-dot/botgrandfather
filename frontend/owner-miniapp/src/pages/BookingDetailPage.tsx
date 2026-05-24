import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

/**
 * BookingDetailPage — explicit booking detail view.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This is a capability-specific page, NOT a generic detail renderer.
 * It is explicit, manually registered, and template-contained.
 *
 * WHY explicit (not generic):
 * - Only booking has complex lifecycle actions today.
 * - Detail views for different capabilities have incompatible schemas.
 * - Creating a generic detail renderer would be premature abstraction.
 *
 * OPERATIONAL RULES:
 * - Read-only data display (calls query endpoint)
 * - Lifecycle actions call runtime endpoints (not frontend logic)
 * - No business logic in frontend
 */

interface BookingDetail {
  id: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  username: string | null;
  userId: string;
  price: number | null;
  timezone: string;
  notes: string | null;
  createdAt: string;
  availableActions: string[];
}

export function BookingDetailPage() {
  const { botId, bookingId } = useParams<{ botId: string; bookingId: string }>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setInitData(initData);
    if (!initData || !botId || !bookingId) {
      setLoading(false);
      return;
    }

    loadBooking();
  }, [initData, botId, bookingId]);

  async function loadBooking() {
    if (!botId || !bookingId) return;
    setLoading(true);
    try {
      const res = await api.getBookingDetail(botId, bookingId);
      setBooking({
        ...res,
        status: res.status as BookingDetail['status'],
      });
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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

  async function handleAction(action: string, apiCall: () => Promise<unknown>) {
    if (!botId || !bookingId) return;
    setActionLoading(action);
    try {
      await apiCall();
      await loadBooking();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
        Loading...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: {error || 'Booking not found'}
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: '#f39c12',
    confirmed: '#27ae60',
    cancelled: '#e74c3c',
    completed: '#3498db',
    'no-show': '#95a5a6',
  };

  const actions = booking.availableActions || [];

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Booking Details</h1>
      </header>

      {/* Status badge */}
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            borderRadius: '10px',
            background: statusColors[booking.status] || '#95a5a6',
            color: '#fff',
            textTransform: 'capitalize',
            fontWeight: 600,
          }}
        >
          {booking.status}
        </span>
      </div>

      {/* Detail fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <DetailRow label="Service" value={booking.serviceName} />
        <DetailRow label="Date" value={booking.date} />
        <DetailRow label="Time" value={booking.timeSlot} />
        <DetailRow label="Timezone" value={booking.timezone} />
        <DetailRow label="Customer" value={booking.username ? `@${booking.username}` : `User ${booking.userId}`} />
        {booking.price !== null && <DetailRow label="Price" value={`$${booking.price}`} />}
        {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
        <DetailRow label="Created" value={new Date(booking.createdAt).toLocaleString()} />
      </div>

      {/* Lifecycle actions — rendered from backend-provided availableActions */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Actions</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {actions.includes('confirm') && (
          <ActionButton
            label="✅ Confirm"
            color="#27ae60"
            loading={actionLoading === 'confirm'}
            onClick={() =>
              handleAction('confirm', () => api.confirmBooking(botId!, bookingId!))
            }
          />
        )}
        {actions.includes('cancel') && (
          <ActionButton
            label="❌ Cancel"
            color="#e74c3c"
            loading={actionLoading === 'cancel'}
            onClick={() =>
              handleAction('cancel', () => api.cancelBooking(botId!, bookingId!))
            }
          />
        )}
        {actions.includes('complete') && (
          <ActionButton
            label="✔️ Complete"
            color="#3498db"
            loading={actionLoading === 'complete'}
            onClick={() =>
              handleAction('complete', () => api.completeBooking(botId!, bookingId!))
            }
          />
        )}
        {actions.includes('no-show') && (
          <ActionButton
            label="🚫 No Show"
            color="#95a5a6"
            loading={actionLoading === 'no-show'}
            onClick={() =>
              handleAction('no-show', () => api.markNoShow(botId!, bookingId!))
            }
          />
        )}
        {actions.length === 0 && (
          <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
            No actions available for this booking status.
          </p>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  color,
  loading,
  onClick,
}: {
  label: string;
  color: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '10px 16px',
        borderRadius: '10px',
        border: 'none',
        background: loading ? '#bdc3c7' : color,
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '...' : label}
    </button>
  );
}
