/**
 * NOTIFICATION BELL — Production
 * Shows announcement notifications for Sales TL and Sales Executive.
 * - Polls unread count every 60 s
 * - Dropdown is scrollable, matches the app's design system
 * - Click on item marks it read; "Mark all read" button at top
 */
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Megaphone, AlertTriangle, Star, CheckCheck, Loader2 } from 'lucide-react';
import {
  fetchMyAnnouncements,
  fetchUnreadCount,
  markAnnouncementRead,
  markAllRead,
} from '../services/announcementService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  ANNOUNCEMENT: {
    icon: <Megaphone size={14} />,
    bg:   'bg-blue-100',
    text: 'text-blue-700',
    dot:  'bg-blue-500',
    label: 'Announcement',
  },
  WARNING: {
    icon: <AlertTriangle size={14} />,
    bg:   'bg-amber-100',
    text: 'text-amber-700',
    dot:  'bg-amber-500',
    label: 'Warning',
  },
  APPRECIATION: {
    icon: <Star size={14} />,
    bg:   'bg-emerald-100',
    text: 'text-emerald-700',
    dot:  'bg-emerald-500',
    label: 'Appreciation',
  },
  INFO: {
    icon: <Megaphone size={14} />,
    bg:   'bg-blue-100',
    text: 'text-blue-700',
    dot:  'bg-blue-500',
    label: 'Info',
  },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.ANNOUNCEMENT;

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// ── Single notification item ──────────────────────────────────────────────────

function NotifItem({ item, onRead }) {
  const cfg = getTypeConfig(item.type);

  return (
    <button
      onClick={() => !item.isRead && onRead(item.id)}
      className={`w-full text-left px-4 py-3 flex gap-3 transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 ${
        item.isRead ? 'opacity-70' : ''
      }`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-bold leading-snug truncate ${item.isRead ? 'text-slate-500' : 'text-[#2a465a]'}`}>
            {item.title}
          </p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {item.message}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          {item.sentBy && (
            <span className="text-[10px] text-slate-400">
              from {item.sentBy}
            </span>
          )}
          {item.expiryDate && (
            <span className="text-[10px] text-slate-400 ml-auto">
              expires {item.expiryDate}
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!item.isRead && (
        <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${cfg.dot}`} />
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function NotificationBell({ userRole }) {
  const [open,         setOpen]         = useState(false);
  const [items,        setItems]        = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [markingAll,   setMarkingAll]   = useState(false);
  const [dropPos,      setDropPos]      = useState({ top: 0, right: 0 });
  const [hasMore,      setHasMore]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [loadingMore,  setLoadingMore]  = useState(false);

  const triggerRef  = useRef(null);
  const pollRef     = useRef(null);

  // Roles that receive announcement notifications
  const isReceiver = ['SALES_TL', 'SALES_EXECUTIVE', 'sales-team-leader', 'sales-executive'].includes(userRole);

  // ── Fetch unread count (for badge) ──
  const refreshBadge = useCallback(async () => {
    if (!isReceiver) return;
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore — badge is non-critical
    }
  }, [isReceiver]);

  // ── Fetch full list (when dropdown opens) ──
  const loadAnnouncements = useCallback(async (pageNum = 1, append = false) => {
    if (!isReceiver) return;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await fetchMyAnnouncements({ page: pageNum, limit: 15 });
      setItems((prev) => append ? [...prev, ...result.announcements] : result.announcements);
      setUnreadCount(result.unreadCount);
      setHasMore(pageNum < result.pages);
      setPage(pageNum);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isReceiver]);

  // ── Poll badge every 60 s ──
  useEffect(() => {
    if (!isReceiver) return;
    refreshBadge();
    pollRef.current = setInterval(refreshBadge, 60_000);
    return () => clearInterval(pollRef.current);
  }, [isReceiver, refreshBadge]);

  // ── Open / close dropdown ──
  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({
        top:   rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    if (!open) {
      loadAnnouncements(1, false);
    }
    setOpen((o) => !o);
  };

  // ── Close on outside click ──
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        const portal = document.getElementById('notif-bell-portal');
        if (portal && portal.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Mark one read ──
  const handleRead = async (id) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, isRead: true } : item)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markAnnouncementRead(id);
    } catch {
      // revert on failure
      setItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, isRead: false } : item)
      );
      setUnreadCount((c) => c + 1);
    }
  };

  // ── Mark all read ──
  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    // Optimistic
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllRead();
    } catch {
      // reload on failure
      loadAnnouncements(1, false);
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Load more ──
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadAnnouncements(page + 1, true);
    }
  };

  // Non-receiver roles: render a static bell (no functionality)
  if (!isReceiver) {
    return (
      <button className="relative text-gray-400 hover:text-gray-600 transition-colors duration-150">
        <Bell size={20} />
      </button>
    );
  }

  const dropdown = open ? createPortal(
    <div
      id="notif-bell-portal"
      className="fixed w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60 overflow-hidden flex flex-col"
      style={{ top: dropPos.top, right: dropPos.right, zIndex: 9999, maxHeight: '480px' }}
    >
      {/* Gradient top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#2a465a] via-blue-400 to-emerald-400 flex-shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-[#2a465a]" />
          <p className="text-xs font-black text-[#2a465a] uppercase tracking-widest">
            Announcements
          </p>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#2a465a] transition-colors disabled:opacity-50"
          >
            {markingAll
              ? <Loader2 size={11} className="animate-spin" />
              : <CheckCheck size={11} />
            }
            Mark all read
          </button>
        )}
      </div>

      {/* List — scrollable */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Bell size={28} className="text-slate-200" />
            <p className="text-xs text-slate-400 font-semibold">No announcements yet</p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <NotifItem key={item.id} item={item} onRead={handleRead} />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="px-4 py-3 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-[11px] font-bold text-[#2a465a] hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  {loadingMore
                    ? <><Loader2 size={11} className="animate-spin" /> Loading…</>
                    : 'Load more'
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0">
        <p className="text-[10px] text-slate-400 text-center">
          Showing announcements sent to you
        </p>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className="relative text-gray-400 hover:text-gray-600 transition-colors duration-150"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {dropdown}
    </>
  );
}

export default memo(NotificationBell);
