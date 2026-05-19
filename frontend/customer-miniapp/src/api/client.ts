const API_BASE = '';

let initData = '';

export function setInitData(data: string) {
  initData = data;
}

async function fetchJson(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  getSlots: (botId: string, date: string) =>
    fetchJson(`/customer/bot/${botId}/slots?date=${encodeURIComponent(date)}`),

  createBooking: (botId: string, body: {
    serviceId: string;
    serviceName: string;
    date: string;
    timeSlot: string;
    durationMinutes: number;
  }) => fetchJson(`/customer/bot/${botId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};
