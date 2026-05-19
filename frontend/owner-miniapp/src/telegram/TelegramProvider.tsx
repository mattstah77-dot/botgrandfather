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
  const [isTelegram, setIsTelegram] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    console.log('[TG] window.Telegram exists:', !!window.Telegram);
    console.log('[TG] window.Telegram.WebApp exists:', !!tg);

    if (!tg) {
      console.warn('[TG] Telegram WebApp not available — showing fallback');
      setIsTelegram(false);
      setReady(true);
      return;
    }

    console.log('[TG] initData length:', tg.initData?.length || 0);
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

  if (!isTelegram) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Open in Telegram
        </h1>
        <p style={{ color: '#666', maxWidth: 280, lineHeight: 1.5 }}>
          This dashboard works inside Telegram Mini App.
          Please open it from @BotGrandFather.
        </p>
      </div>
    );
  }

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
