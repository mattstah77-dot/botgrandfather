import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

/**
 * CapabilityPage — generic capability data viewer.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This page renders capability-specific data generically.
 * It does NOT hardcode "bookings" or "leads" semantics.
 *
 * CAPABILITY NEUTRALITY:
 * The page structure is universal. Only rendering logic
 * is capability-aware.
 *
 * TRANSITIONAL NOTE:
 * Currently uses template-specific API calls. When backend
 * provides generic capability endpoint, this routes there.
 */

interface CapabilityItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, string>;
}

interface CapabilityData {
  items: CapabilityItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

interface CapabilityPageParams {
  botId: string;
  capability: string;
  [key: string]: string | undefined;
}

export function CapabilityPage() {
  const { botId, capability } = useParams<CapabilityPageParams>();
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const [data, setData] = useState<CapabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc'>('date-desc');
  const limit = 20;

  const loadData = useCallback(() => {
    if (!initData || !botId || !capability) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getCapabilityData(botId, capability, page, limit, statusFilter, searchQuery, sortOrder)
      .then((res) => {
        setData({
          items: res.items.map(transformToCapabilityItem),
          pagination: res.pagination,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initData, botId, capability, page, statusFilter, searchQuery, sortOrder]);

  useEffect(() => {
    setInitData(initData);
    loadData();
  }, [initData, loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, sortOrder]);

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

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: {error}
      </div>
    );
  }

  if (!capability) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: Missing capability parameter
      </div>
    );
  }

  const capabilityInfo = getCapabilityInfo(capability);

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>{capabilityInfo.title}</h1>
        <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          {data?.pagination.total || 0} total
        </p>
      </header>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--tg-theme-hint-color, #ddd)',
              background: 'var(--tg-theme-bg-color, #fff)',
              color: 'var(--tg-theme-text-color)',
              fontSize: '14px',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--tg-theme-hint-color, #ddd)',
              background: 'var(--tg-theme-bg-color, #fff)',
              color: 'var(--tg-theme-text-color)',
              fontSize: '14px',
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setSortOrder((s) => (s === 'date-desc' ? 'date-asc' : 'date-desc'))}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--tg-theme-hint-color, #ddd)',
              background: 'var(--tg-theme-secondary-bg-color, #fff)',
              color: 'var(--tg-theme-text-color)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Sort: {sortOrder === 'date-desc' ? 'Newest First' : 'Oldest First'}
          </button>
          <button
            onClick={loadData}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--tg-theme-button-color, #2481cc)',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {!data || data.items.length === 0 ? (
        <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
          No {capabilityInfo.title.toLowerCase()} yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.items.map((item) => (
            <CapabilityCard
              key={item.id}
              item={item}
              capability={capability}
              onClick={() => navigate(`/bots/${botId}/bookings/${item.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              background: page === 1 ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-button-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px', color: 'var(--tg-theme-text-color)' }}>
            Page {page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
            disabled={page === data.pagination.pages}
            style={{
              padding: '8px 16px',
              background: page === data.pagination.pages ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-button-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: page === data.pagination.pages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Transform capability-specific API response to generic CapabilityItem.
 */
function transformToCapabilityItem(item: any): CapabilityItem {
  // Booking transformation
  if (item.serviceName && item.date && item.timeSlot) {
    return {
      id: item.id,
      title: item.serviceName,
      subtitle: `${item.date} at ${item.timeSlot}`,
      status: item.status,
      metadata: {
        username: item.username,
        createdAt: item.createdAt,
      },
    };
  }

  // Generic fallback
  return {
    id: item.id,
    title: item.title || item.name || 'Unknown',
    subtitle: item.subtitle || item.description,
    status: item.status,
    metadata: item,
  };
}

/**
 * Map navigation IDs to capability keys and display titles.
 */
const CAPABILITY_MAP: Record<string, { key: string; title: string }> = {
  bookings: { key: 'booking', title: 'Bookings' },
  calendar: { key: 'booking', title: 'Calendar' },
  leads: { key: 'lead-funnel', title: 'Leads' },
};

/**
 * Get capability info from navigation ID.
 */
function getCapabilityInfo(navigationId: string): { key: string; title: string } {
  return CAPABILITY_MAP[navigationId] || {
    key: navigationId,
    title: navigationId.split('-').map(capitalize).join(' '),
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * CapabilityCard — renders capability item generically.
 *
 * TRANSITIONAL: Booking-specific click navigation is explicit.
 * When a third template needs detail views, extract pattern.
 */
function CapabilityCard({
  item,
  capability,
  onClick,
}: {
  item: CapabilityItem;
  capability: string;
  onClick?: () => void;
}) {
  const isBooking = capability === 'bookings' || capability === 'booking';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        background: 'var(--tg-theme-secondary-bg-color, #fff)',
        borderRadius: '12px',
        border: '1px solid var(--tg-theme-hint-color, #ddd)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>{item.title}</span>
        {item.status && <StatusBadge status={item.status} />}
      </div>
      {item.subtitle && (
        <div style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
          {item.subtitle}
        </div>
      )}
      {item.metadata?.username && (
        <div style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
          👤 @{item.metadata.username}
        </div>
      )}
      {isBooking && onClick && (
        <div style={{ fontSize: '12px', color: 'var(--tg-theme-button-color)', marginTop: '6px' }}>
          View details →
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: '#f39c12',
    confirmed: '#27ae60',
    cancelled: '#e74c3c',
    completed: '#3498db',
    'no-show': '#95a5a6',
  };

  return (
    <span
      style={{
        padding: '3px 10px',
        fontSize: '11px',
        borderRadius: '10px',
        background: colors[status] || '#95a5a6',
        color: '#fff',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}
