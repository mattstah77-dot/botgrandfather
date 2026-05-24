import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../telegram/TelegramProvider';
import { api, setInitData } from '../api/client';

/**
 * TicketDetailPage — support desk ticket detail view.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This page renders ticket detail from backend metadata.
 * It does NOT contain business logic — only rendering.
 *
 * BACKEND-DRIVEN ACTIONS:
 * availableActions from backend determines which buttons render.
 * Frontend has ZERO knowledge of ticket lifecycle semantics.
 */

interface TicketMessage {
  id: string;
  senderType: string;
  senderName: string | null;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

interface TicketDetailData {
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
  messages: TicketMessage[];
  availableActions: string[];
}

export function TicketDetailPage() {
  const { botId, ticketId } = useParams<{ botId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { initData, user } = useTelegram();
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setInitData(initData);
    if (!initData || !botId || !ticketId) {
      setLoading(false);
      return;
    }

    loadTicket();
  }, [initData, botId, ticketId]);

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

  async function loadTicket() {
    if (!botId || !ticketId) return;
    try {
      const data = await api.getTicketDetail(botId, ticketId);
      setTicket(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    if (!botId || !ticketId || !ticket || !user) return;

    setActionLoading(action);

    try {
      const ownerId = String(user.id);

      switch (action) {
        case 'take':
          await api.takeTicket(botId, ticketId, ownerId);
          break;
        case 'resolve':
          await api.resolveTicket(botId, ticketId, ownerId, ''); // botToken will be resolved on backend
          break;
        case 'close':
          await api.closeTicket(botId, ticketId, ownerId, '');
          break;
        case 'reopen':
          await api.reopenTicket(botId, ticketId, ownerId);
          break;
        default:
          console.warn('Unknown action:', action);
      }

      // Reload ticket to get updated state and available actions
      await loadTicket();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReply() {
    if (!botId || !ticketId || !replyText.trim() || !user) return;

    setActionLoading('reply');

    try {
      await api.replyToTicket(botId, ticketId, replyText.trim(), String(user.id), '');
      setReplyText('');
      await loadTicket();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--tg-theme-hint-color)' }}>
        Loading...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#e74c3c' }}>
        Error: {error || 'Ticket not found'}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Ticket #{ticket.id.slice(0, 8)}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', margin: 0 }}>
          {ticket.subject || 'No subject'}
        </p>
      </header>

      {/* Customer Info */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--tg-theme-secondary-bg-color, #fff)',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid var(--tg-theme-hint-color, #ddd)',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500 }}>
          👤 {ticket.customerName || ticket.customerUsername || 'Unknown Customer'}
        </div>
        {ticket.customerUsername && (
          <div style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
            @{ticket.customerUsername}
          </div>
        )}
        <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Ticket Metadata */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <MetaCard label="Priority" value={ticket.priority} color={getPriorityColor(ticket.priority)} />
        <MetaCard label="Category" value={ticket.category || 'None'} />
        <MetaCard label="Assigned To" value={ticket.assignedTo || 'Unassigned'} />
        <MetaCard label="Messages" value={String(ticket.messages.length)} />
      </div>

      {/* Actions */}
      {ticket.availableActions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ticket.availableActions.map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={actionLoading === action}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: action === 'close' ? '#e74c3c' : action === 'resolve' ? '#27ae60' : 'var(--tg-theme-button-color, #2481cc)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: actionLoading === action ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === action ? 0.7 : 1,
                }}
              >
                {actionLoading === action ? '...' : formatActionLabel(action)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply Input */}
      {ticket.status !== 'closed' && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Reply</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
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
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || actionLoading === 'reply'}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--tg-theme-button-color, #2481cc)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: !replyText.trim() || actionLoading === 'reply' ? 'not-allowed' : 'pointer',
                opacity: !replyText.trim() || actionLoading === 'reply' ? 0.7 : 1,
              }}
            >
              {actionLoading === 'reply' ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Message History */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Messages</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ticket.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isCustomer = message.senderType === 'customer';
  const isSystem = message.senderType === 'system';

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: '10px',
        background: isSystem
          ? 'var(--tg-theme-hint-color, #ddd)'
          : isCustomer
          ? 'var(--tg-theme-secondary-bg-color, #fff)'
          : 'var(--tg-theme-button-color, #2481cc)',
        color: isSystem ? 'var(--tg-theme-text-color)' : isCustomer ? 'var(--tg-theme-text-color)' : '#fff',
        border: isSystem ? 'none' : '1px solid var(--tg-theme-hint-color, #ddd)',
        alignSelf: isCustomer ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', opacity: 0.8 }}>
        {message.senderName || message.senderType}
      </div>
      <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{message.message}</div>
      <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.6 }}>
        {new Date(message.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

function MetaCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'var(--tg-theme-secondary-bg-color, #fff)',
        borderRadius: '8px',
        border: '1px solid var(--tg-theme-hint-color, #ddd)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: color || 'var(--tg-theme-text-color)' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: '#e74c3c',
    'in-progress': '#3498db',
    resolved: '#27ae60',
    closed: '#95a5a6',
  };

  return (
    <span
      style={{
        padding: '4px 12px',
        fontSize: '12px',
        borderRadius: '10px',
        background: colors[status] || '#95a5a6',
        color: '#fff',
        textTransform: 'capitalize',
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: '#e74c3c',
    high: '#e67e22',
    medium: '#f39c12',
    low: '#27ae60',
  };
  return colors[priority] || '#95a5a6';
}

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    take: 'Take',
    assign: 'Assign',
    reply: 'Reply',
    resolve: 'Resolve',
    close: 'Close',
    reopen: 'Reopen',
  };
  return labels[action] || action;
}
