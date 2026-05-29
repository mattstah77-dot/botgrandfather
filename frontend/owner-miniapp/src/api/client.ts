const API_BASE = '';

let initDataHeader = '';

export function setInitData(initData: string) {
  initDataHeader = initData;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  console.log('[API]', options.method || 'GET', url, 'initData length:', initDataHeader.length);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initDataHeader,
      ...options.headers,
    },
  });

  console.log('[API] response', res.status, url);

  if (!res.ok) {
    const text = await res.text().catch(() => 'no body');
    console.error('[API] error body:', text);
    if (res.status === 401) {
      throw new Error('Unauthorized: ' + text);
    }
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── UNIVERSAL API —──────────────────────────────────────────

export const api = {
  /** Get owner dashboard data (universal) */
  getDashboard: () => request<{
    owner: { id: string; telegramUserId: bigint; username: string | null };
    stats: { totalBots: number; totalCustomers: number; totalInteractions: number };
    bots: Array<{ id: string; template: string; status: string; createdAt: string }>;
  }>('/miniapp/dashboard'),

  /** Get navigation (composed from OwnerModuleRegistry) */
  getNavigation: () => request<{ navigation: Array<{ id: string; label: string; route: string; icon?: string; source?: string; template?: string }> }>('/miniapp/navigation'),

  /** Get current owner profile */
  getMe: () => request<{
    session: { ownerId: string; telegramUserId: string; username?: string };
    profile: { id: string; telegramUserId: bigint; username: string | null };
  }>('/miniapp/me'),

  /** Get bot overview (template-agnostic) */
  getBotOverview: (botId: string) => request<{
    botId: string;
    template: string;
    createdAt: string;
    stats: {
      customers: number;
      customersByStatus: Record<string, number>;
      interactions: number;
      events: number;
    };
  }>(`/miniapp/bots/${botId}/overview`),

  /** Get bot customers (universal) */
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

  /** Get bot analytics (universal) */
  getBotAnalytics: (botId: string) => request<{
    events: Array<{ eventType: string; count: number }>;
  }>(`/miniapp/bots/${botId}/analytics`),

  // ─── CAPABILITY-SPECIFIC ENDPOINTS ───────────────────────
  // These are template-specific operational endpoints.
  // They are NOT universal — each capability defines its own data shape.
  // Frontend composes them through generic widgets, not hardcoded pages.

  /** Get capability data for a bot (generic wrapper) */
  getCapabilityData: (botId: string, capability: string, page = 1, limit = 20, status?: string, search?: string, sort = 'date-desc') => {
    // Map navigation IDs to capability keys
    // This is the transitional bridge between navigation metadata
    // and backend capability endpoints.
    const capabilityMap: Record<string, string> = {
      bookings: 'booking',
      calendar: 'booking',
      leads: 'lead-funnel',
    };

    const resolvedCapability = capabilityMap[capability] || capability;

    switch (resolvedCapability) {
      case 'booking':
        return api.getBotBookings(botId, page, limit, status, search, sort);
      default:
        throw new Error(`Unknown capability: ${capability} (resolved: ${resolvedCapability})`);
    }
  },

  /** Get bot bookings (booking capability) */
  getBotBookings: (botId: string, page = 1, limit = 20, status?: string, search?: string, sort = 'date-desc') => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    return request<{
      items: Array<{
        id: string;
        serviceName: string;
        date: string;
        timeSlot: string;
        status: string;
        customerName: string;
        providerName?: string | null;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/miniapp/bots/${botId}/bookings?${params.toString()}`);
  },

  /** Get booking dashboard metrics */
  getBookingMetrics: (botId: string) => request<{
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  }>(`/miniapp/bots/${botId}/bookings/metrics`),

  /** Get booking calendar projection */
  getBookingCalendar: (botId: string, from: string, to: string) => request<Array<{
    date: string;
    bookings: Array<{
      id: string;
      serviceName: string;
      timeSlot: string;
      status: string;
      customerName: string;
    }>;
  }>>(`/miniapp/bots/${botId}/bookings/calendar?from=${from}&to=${to}`),

  /** Get single booking detail */
  getBookingDetail: (botId: string, bookingId: string) => request<{
    id: string;
    serviceName: string;
    date: string;
    timeSlot: string;
    status: string;
    username: string | null;
    userId: string;
    price: number | null;
    timezone: string;
    notes: string | null;
    createdAt: string;
    availableActions: string[];
  }>(`/miniapp/bots/${botId}/bookings/${bookingId}`),

  /** Confirm a pending booking */
  confirmBooking: (botId: string, bookingId: string) => request<{ success: boolean; booking: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/bookings/${bookingId}/confirm`,
    { method: 'POST' },
  ),

  /** Cancel a booking */
  cancelBooking: (botId: string, bookingId: string, reason?: string) => request<{ success: boolean; booking: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/bookings/${bookingId}/cancel`,
    { method: 'POST', body: JSON.stringify({ reason }) },
  ),

  /** Mark booking as completed */
  completeBooking: (botId: string, bookingId: string) => request<{ success: boolean; booking: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/bookings/${bookingId}/complete`,
    { method: 'POST' },
  ),

  /** Mark booking as no-show */
  markNoShow: (botId: string, bookingId: string) => request<{ success: boolean; booking: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/bookings/${bookingId}/no-show`,
    { method: 'POST' },
  ),

  // ─── SUPPORT DESK ENDPOINTS ────────────────────────────────

  /** Get bot tickets (support desk capability) */
  getBotTickets: (botId: string, page = 1, limit = 20, status?: string, search?: string, sort = 'newest') => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    return request<{
      items: Array<{
        id: string;
        subject: string | null;
        status: string;
        priority: string;
        category: string | null;
        assignedTo: string | null;
        customerName: string | null;
        customerUsername: string | null;
        messageCount: number;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/miniapp/bots/${botId}/tickets?${params.toString()}`);
  },

  /** Get single ticket detail */
  getTicketDetail: (botId: string, ticketId: string) => request<{
    id: string;
    botId: string;
    customerId: string;
    customerName: string | null;
    customerUsername: string | null;
    status: string;
    priority: string;
    category: string | null;
    subject: string | null;
    assignedTo: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
    messages: Array<{
      id: string;
      senderType: string;
      senderName: string | null;
      message: string;
      isInternal: boolean;
      createdAt: string;
    }>;
    availableActions: string[];
  }>(`/miniapp/bots/${botId}/tickets/${ticketId}`),

  /** Take (self-assign) a ticket */
  takeTicket: (botId: string, ticketId: string, ownerId: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/take`,
    { method: 'POST', body: JSON.stringify({ ownerId }) },
  ),

  /** Assign ticket to agent */
  assignTicket: (botId: string, ticketId: string, assigneeId: string, assignedBy: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/assign`,
    { method: 'POST', body: JSON.stringify({ assigneeId, assignedBy }) },
  ),

  /** Reply to a ticket */
  replyToTicket: (botId: string, ticketId: string, message: string, senderId: string, botToken: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/reply`,
    { method: 'POST', body: JSON.stringify({ message, senderId, botToken }) },
  ),

  /** Resolve a ticket */
  resolveTicket: (botId: string, ticketId: string, resolvedBy: string, botToken: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/resolve`,
    { method: 'POST', body: JSON.stringify({ resolvedBy, botToken }) },
  ),

  /** Close a ticket */
  closeTicket: (botId: string, ticketId: string, closedBy: string, botToken: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/close`,
    { method: 'POST', body: JSON.stringify({ closedBy, botToken }) },
  ),

  /** Reopen a ticket */
  reopenTicket: (botId: string, ticketId: string, reopenedBy: string) => request<{ success: boolean; ticket: { id: string; status: string } }>(
    `/miniapp/bots/${botId}/tickets/${ticketId}/reopen`,
    { method: 'POST', body: JSON.stringify({ reopenedBy }) },
  ),
};
