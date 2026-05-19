import { useState, useEffect, useCallback } from 'react';
import { TelegramProvider, useTelegram } from './telegram/TelegramProvider';
import { api, setInitData } from './api/client';

type Step = 'service' | 'date' | 'time' | 'confirm' | 'success';

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price?: number;
}

interface BookingData {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  date: string;
  timeSlot: string;
}

export default function App() {
  return (
    <TelegramProvider>
      <BookingFlow />
    </TelegramProvider>
  );
}

function BookingFlow() {
  const { initData, isTelegram, ready } = useTelegram();
  const [step, setStep] = useState<Step>('service');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState('');

  const botId = getBotIdFromUrl();

  useEffect(() => {
    setInitData(initData);
  }, [initData]);

  const onSelectService = useCallback((service: Service) => {
    setBooking({
      serviceId: service.id,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      date: '',
      timeSlot: '',
    });
    setStep('date');
  }, []);

  const onSelectDate = useCallback((date: string) => {
    setBooking((prev) => prev ? { ...prev, date } : null);
    setStep('time');
  }, []);

  const onSelectTime = useCallback((timeSlot: string) => {
    setBooking((prev) => prev ? { ...prev, timeSlot } : null);
    setStep('confirm');
  }, []);

  const onConfirm = useCallback(async () => {
    if (!booking || !botId) return;
    try {
      await api.createBooking(botId, {
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        durationMinutes: booking.durationMinutes,
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  }, [booking, botId]);

  const onRestart = useCallback(() => {
    setBooking(null);
    setError('');
    setStep('service');
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!isTelegram) {
    return (
      <div style={centerStyle}>
        <h2 style={{ marginBottom: 12 }}>Open in Telegram</h2>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: 280 }}>
          Please open this booking app from inside Telegram to continue.
        </p>
      </div>
    );
  }

  if (!botId) {
    return (
      <div style={centerStyle}>
        <h2 style={{ marginBottom: 12, color: '#e74c3c' }}>Invalid Link</h2>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Bot ID is missing. Please open this app from the booking bot.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <h2 style={{ marginBottom: 12, color: '#e74c3c' }}>Error</h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>{error}</p>
        <button onClick={onRestart} style={primaryButtonStyle}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['service', 'date', 'time', 'confirm'] as Step[]).map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: step === s || (step === 'success' && i < 3)
                ? '#27ae60'
                : stepIndex(step) > i
                ? '#27ae60'
                : '#ddd',
            }}
          />
        ))}
      </div>

      {step === 'service' && <ServiceStep onSelect={onSelectService} />}
      {step === 'date' && <DateStep onSelect={onSelectDate} onBack={() => setStep('service')} />}
      {step === 'time' && <TimeStep botId={botId} date={booking?.date || ''} onSelect={onSelectTime} onBack={() => setStep('date')} />}
      {step === 'confirm' && <ConfirmStep booking={booking!} onConfirm={onConfirm} onBack={() => setStep('time')} />}
      {step === 'success' && <SuccessStep booking={booking!} onRestart={onRestart} />}
    </div>
  );
}

function stepIndex(step: Step): number {
  return ['service', 'date', 'time', 'confirm', 'success'].indexOf(step);
}

function getBotIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('botId');
}

// ─── Steps ─────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: 'consultation', name: 'Consultation', durationMinutes: 30, price: 50 },
  { id: 'session', name: 'Full Session', durationMinutes: 60, price: 100 },
  { id: 'premium', name: 'Premium Package', durationMinutes: 90, price: 150 },
];

function ServiceStep({ onSelect }: { onSelect: (s: Service) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Select Service</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            style={cardButtonStyle}
          >
            <div style={{ fontWeight: 500, fontSize: 16 }}>{service.name}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              {service.durationMinutes} min{service.price ? ` · $${service.price}` : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateStep({ onSelect, onBack }: { onSelect: (date: string) => void; onBack: () => void }) {
  const dates = generateNextDates(14);
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Select Date</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dates.map((date) => (
          <button key={date.iso} onClick={() => onSelect(date.iso)} style={cardButtonStyle}>
            <span style={{ fontWeight: 500 }}>{date.label}</span>
            <span style={{ color: '#666', fontSize: 13 }}>{date.weekday}</span>
          </button>
        ))}
      </div>
      <button onClick={onBack} style={{ ...secondaryButtonStyle, marginTop: 16 }}>
        ← Back
      </button>
    </div>
  );
}

function TimeStep({
  botId,
  date,
  onSelect,
  onBack,
}: {
  botId: string;
  date: string;
  onSelect: (time: string) => void;
  onBack: () => void;
}) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSlots(botId, date)
      .then((data: string[]) => {
        setSlots(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [botId, date]);

  if (loading) return <LoadingScreen />;
  if (error) return <div style={{ color: '#e74c3c' }}>{error}</div>;
  if (slots.length === 0) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#666', marginBottom: 16 }}>No available slots for this date.</p>
        <button onClick={onBack} style={secondaryButtonStyle}>← Back</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Select Time</h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>{date}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {slots.map((time) => (
          <button key={time} onClick={() => onSelect(time)} style={timeButtonStyle}>
            {time}
          </button>
        ))}
      </div>
      <button onClick={onBack} style={{ ...secondaryButtonStyle, marginTop: 16 }}>
        ← Back
      </button>
    </div>
  );
}

function ConfirmStep({
  booking,
  onConfirm,
  onBack,
}: {
  booking: BookingData;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Confirm Booking</h2>
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Service</span>
          <span style={{ fontWeight: 500 }}>{booking.serviceName}</span>
        </div>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Date</span>
          <span style={{ fontWeight: 500 }}>{booking.date}</span>
        </div>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Time</span>
          <span style={{ fontWeight: 500 }}>{booking.timeSlot}</span>
        </div>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Duration</span>
          <span style={{ fontWeight: 500 }}>{booking.durationMinutes} min</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ ...secondaryButtonStyle, flex: 1 }}>
          ← Back
        </button>
        <button onClick={onConfirm} style={{ ...primaryButtonStyle, flex: 2 }}>
          ✅ Confirm Booking
        </button>
      </div>
    </div>
  );
}

function SuccessStep({ booking, onRestart }: { booking: BookingData; onRestart: () => void }) {
  return (
    <div style={centerStyle}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, fontSize: 32,
      }}>
        ✓
      </div>
      <h2 style={{ marginBottom: 8 }}>Booking Confirmed!</h2>
      <div style={{ ...cardStyle, width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Service</span>
          <span style={{ fontWeight: 500 }}>{booking.serviceName}</span>
        </div>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Date</span>
          <span style={{ fontWeight: 500 }}>{booking.date}</span>
        </div>
        <div style={confirmRowStyle}>
          <span style={{ color: '#666' }}>Time</span>
          <span style={{ fontWeight: 500 }}>{booking.timeSlot}</span>
        </div>
      </div>
      <button onClick={onRestart} style={primaryButtonStyle}>
        Book Another
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={centerStyle}>
      <div style={{ color: '#666' }}>Loading...</div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function generateNextDates(count: number): { iso: string; label: string; weekday: string }[] {
  const today = new Date();
  const dates: { iso: string; label: string; weekday: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      iso: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  return dates;
}

// ─── Styles ────────────────────────────────────────────────────

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: 24,
};

const cardButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '14px 16px',
  background: 'var(--tg-theme-secondary-bg-color, #fff)',
  border: '1px solid var(--tg-theme-hint-color, #ddd)',
  borderRadius: 12,
  color: 'var(--tg-theme-text-color, #000)',
  fontSize: 15,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};

const timeButtonStyle: React.CSSProperties = {
  padding: '12px 8px',
  background: 'var(--tg-theme-secondary-bg-color, #fff)',
  border: '1px solid var(--tg-theme-hint-color, #ddd)',
  borderRadius: 10,
  color: 'var(--tg-theme-text-color, #000)',
  fontSize: 14,
  cursor: 'pointer',
  fontWeight: 500,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: '#27ae60',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: 'transparent',
  color: 'var(--tg-theme-text-color, #000)',
  border: '1px solid var(--tg-theme-hint-color, #ddd)',
  borderRadius: 12,
  fontSize: 16,
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  padding: 16,
  background: 'var(--tg-theme-secondary-bg-color, #fff)',
  borderRadius: 12,
  border: '1px solid var(--tg-theme-hint-color, #ddd)',
};

const confirmRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #eee',
};
