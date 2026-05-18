import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

interface NavItem {
  id: string;
  label: string;
  route: string;
}

export function Navigation() {
  const { initData } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setInitData(initData);
    if (!initData) return;

    api.getNavigation()
      .then((data) => setNavItems(data.navigation))
      .catch((err) => setError(err.message));
  }, [initData]);

  if (error) return null;
  if (navItems.length === 0) return null;

  // Only show bottom nav on dashboard
  if (!location.pathname.match(/^\/$/)) return null;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        background: 'var(--tg-theme-secondary-bg-color, #fff)',
        borderTop: '1px solid var(--tg-theme-hint-color, #ddd)',
        zIndex: 100,
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          style={{
            flex: 1,
            padding: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--tg-theme-text-color, #000)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
