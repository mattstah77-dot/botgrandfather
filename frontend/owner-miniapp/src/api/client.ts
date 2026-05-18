const API_BASE = '';

let initDataHeader = '';

export function setInitData(initData: string) {
  initDataHeader = initData;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initDataHeader,
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<{
    owner: { id: string; telegramUserId: bigint; username: string | null };
    stats: { totalBots: number; totalCustomers: number; totalInteractions: number };
    bots: Array<{ id: string; template: string; status: string; createdAt: string }>;
  }>('/miniapp/dashboard'),

  getNavigation: () => request<{ navigation: Array<{ id: string; label: string; route: string }> }>('/miniapp/navigation'),

  getMe: () => request<{
    session: { ownerId: string; telegramUserId: string; username?: string };
    profile: { id: string; telegramUserId: bigint; username: string | null };
  }>('/miniapp/me'),

  getBotOverview: (botId: string) => request<{
    botId: string;
    template: string;
    createdAt: string;
    stats: {
      customers: number;
      customersByStatus: Record<string, number>;
      leads: number;
      events: number;
    };
  }>(`/miniapp/bots/${botId}/overview`),

  getBotBookings: (botId: string, page = 1, limit = 20) => request<{
    items: Array<{
      id: string;
      serviceName: string;
      date: string;
      timeSlot: string;
      status: string;
      username: string | null;
      createdAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/miniapp/bots/${botId}/bookings?page=${page}&limit=${limit}`),

  getBotCustomers: (botId: string, page = 1, limit = 20) => request<{
    items: Array<{
      id: string;
      telegramUserId: bigint;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      status: string;
      createdAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/miniapp/bots/${botId}/customers?page=${page}&limit=${limit}`),
};
