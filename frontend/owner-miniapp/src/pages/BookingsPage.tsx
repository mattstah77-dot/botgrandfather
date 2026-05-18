import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: string;
  username: string | null;
  createdAt: string;
}

export function BookingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setInitData(initData);
    if (!initData || !id) {
      setLoading(false);
      return;
    }

    api.getBotBookings(id, pagination.page, pagination.limit)
      .then((res) => {
        setBookings(res.items);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData, id, pagination.page]);

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

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Bookings</h1>
        <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          {pagination.total} total
        </p>
      </header>

      {bookings.length === 0 ? (
        <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
          No bookings yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                padding: '14px 16px',
                background: 'var(--tg-theme-secondary-bg-color, #fff)',
                borderRadius: '12px',
                border: '1px solid var(--tg-theme-hint-color, #ddd)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{b.serviceName}</span>
                <StatusBadge status={b.status} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                📅 {b.date} &nbsp; 🕐 {b.timeSlot}
              </div>
              {b.username && (
                <div style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
                  👤 @{b.username}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: '#f39c12',
    confirmed: '#27ae60',
    cancelled: '#e74c3c',
    completed: '#3498db',
  };

  return (
    <span
      style={{
        padding: '3px 10px',
        fontSize: '11px',
        borderRadius: '10px',
        background: colors[status] || '#95a5a6',
        color: '#fff',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}
