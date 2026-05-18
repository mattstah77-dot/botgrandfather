import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

interface Bot {
  id: string;
  template: string;
  status: string;
  createdAt: string;
}

export function DashboardPage() {
  const { initData, user } = useTelegram();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [stats, setStats] = useState({ totalBots: 0, totalCustomers: 0, totalInteractions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setInitData(initData);
    if (!initData) {
      setLoading(false);
      return;
    }

    api.getDashboard()
      .then((data) => {
        setBots(data.bots);
        setStats(data.stats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData]);

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
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          {user?.first_name || user?.username || 'Owner'}
        </p>
      </header>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Bots" value={stats.totalBots} />
        <StatCard label="Customers" value={stats.totalCustomers} />
        <StatCard label="Events" value={stats.totalInteractions} />
      </div>

      {/* Bots list */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Your Bots</h2>
      {bots.length === 0 ? (
        <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
          No bots yet. Create one via @BotGrandFather.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bots.map((bot) => (
            <button
              key={bot.id}
              onClick={() => navigate(`/bots/${bot.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--tg-theme-secondary-bg-color, #fff)',
                border: '1px solid var(--tg-theme-hint-color, #ddd)',
                borderRadius: '12px',
                color: 'var(--tg-theme-text-color)',
                fontSize: '15px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>
                <span style={{ fontWeight: 500 }}>@{bot.template}</span>
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: '8px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '10px',
                    background: '#27ae60',
                    color: '#fff',
                  }}
                >
                  {bot.status}
                </span>
              </span>
              <span style={{ color: 'var(--tg-theme-hint-color)', fontSize: '13px' }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '14px',
        background: 'var(--tg-theme-secondary-bg-color, #fff)',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid var(--tg-theme-hint-color, #ddd)',
      }}
    >
      <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>{label}</div>
    </div>
  );
}
