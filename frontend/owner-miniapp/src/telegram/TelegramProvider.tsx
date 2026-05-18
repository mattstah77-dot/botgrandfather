import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
          };
        };
        themeParams: Record<string, string>;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
      };
    };
  }
}

interface TelegramContextValue {
  initData: string;
  user: Window['Telegram']['WebApp']['initDataUnsafe']['user'] | null;
  ready: boolean;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.warn('Telegram WebApp not available');
      setReady(true);
      return;
    }

    tg.ready();
    tg.expand();

    // Apply theme colors
    const bg = tg.themeParams.bg_color || '#f5f5f5';
    document.body.style.backgroundColor = bg;
    tg.setBackgroundColor(bg);
    tg.setHeaderColor(bg);

    setReady(true);
  }, []);

  const tg = window.Telegram?.WebApp;
  const value: TelegramContextValue = {
    initData: tg?.initData || '',
    user: tg?.initDataUnsafe?.user || null,
    ready,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error('useTelegram must be used inside TelegramProvider');
  return ctx;
}
