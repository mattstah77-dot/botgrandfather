import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

export function BotOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [data, setData] = useState<{
    botId: string;
    template: string;
    createdAt: string;
    stats: {
      customers: number;
      customersByStatus: Record<string, number>;
      leads: number;
      events: number;
    };
  } | null>(null);
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
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData, id]);

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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Customers" value={data.stats.customers} />
        <StatCard label="Leads" value={data.stats.leads} />
        <StatCard label="Events" value={data.stats.events} />
        <StatCard
          label="Converted"
          value={data.stats.customersByStatus?.converted || 0}
        />
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Actions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ActionButton label="📅 View Bookings" onClick={() => navigate(`/bots/${id}/bookings`)} />
        <ActionButton label="👥 View Customers" onClick={() => navigate(`/bots/${id}/customers`)} />
      </div>
    </div>
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
