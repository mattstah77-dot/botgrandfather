const API_BASE = '';

let initData = '';

export function setInitData(data: string) {
  initData = data;
}

async function fetchJson(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  console.log('[Customer API]', options?.method || 'GET', url, 'initData length:', initData.length);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...options?.headers,
    },
  });

  console.log('[Customer API] response', res.status, url);

  if (!res.ok) {
    const text = await res.text().catch(() => 'no body');
    console.error('[Customer API] error body:', text);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  getSlots: (botId: string, date: string) =>
    fetchJson(`/api/customer/bot/${botId}/slots?date=${encodeURIComponent(date)}`),

  createBooking: (botId: string, body: {
    serviceId: string;
    serviceName: string;
    date: string;
    timeSlot: string;
    durationMinutes: number;
  }) => fetchJson(`/api/customer/bot/${botId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};
