import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

interface CalendarBooking {
  id: string;
  serviceName: string;
  timeSlot: string;
  status: string;
  customerName: string;
}

interface CalendarDay {
  date: string;
  bookings: CalendarBooking[];
}

export function CalendarPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthYearLabel = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const fromDate = useMemo(() => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return d.toISOString().split('T')[0];
  }, [currentMonth]);

  const toDate = useMemo(() => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return d.toISOString().split('T')[0];
  }, [currentMonth]);

  useEffect(() => {
    setInitData(initData);
    if (!initData || !botId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getBookingCalendar(botId, fromDate, toDate)
      .then((res) => {
        setCalendar(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData, botId, fromDate, toDate]);

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

  const goToPrevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

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

  const calendarMap = new Map(calendar.map((d) => [d.date, d.bookings]));

  // Build grid of days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const days: Array<{ date: number; dateStr: string; bookings: CalendarBooking[] } | null> = [];

  // Empty cells before start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ date: d, dateStr, bookings: calendarMap.get(dateStr) || [] });
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Calendar</h1>
      </header>

      {/* Month navigator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={goToPrevMonth}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            color: 'var(--tg-theme-text-color)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>{monthYearLabel}</span>
        <button
          onClick={goToNextMonth}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            color: 'var(--tg-theme-text-color)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {dayNames.map((name) => (
          <div key={name} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tg-theme-hint-color)', padding: '4px' }}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((day, idx) => (
          <div
            key={idx}
            style={{
              minHeight: '70px',
              padding: '6px',
              borderRadius: '8px',
              background: day ? 'var(--tg-theme-secondary-bg-color, #fff)' : 'transparent',
              border: day ? '1px solid var(--tg-theme-hint-color, #eee)' : 'none',
              cursor: day ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (day && day.bookings.length > 0) {
                // Navigate to first booking of the day
                navigate(`/bots/${botId}/bookings/${day.bookings[0].id}`);
              }
            }}
          >
            {day && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{day.date}</div>
                {day.bookings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {day.bookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          background: getStatusColor(b.status),
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {b.timeSlot} {b.serviceName}
                      </div>
                    ))}
                    {day.bookings.length > 3 && (
                      <div style={{ fontSize: '10px', color: 'var(--tg-theme-hint-color)' }}>
                        +{day.bookings.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Pending', color: '#f39c12' },
          { label: 'Confirmed', color: '#27ae60' },
          { label: 'Completed', color: '#3498db' },
          { label: 'Cancelled', color: '#e74c3c' },
          { label: 'No Show', color: '#95a5a6' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
            <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f39c12',
    confirmed: '#27ae60',
    cancelled: '#e74c3c',
    completed: '#3498db',
    'no-show': '#95a5a6',
  };
  return colors[status] || '#95a5a6';
}
