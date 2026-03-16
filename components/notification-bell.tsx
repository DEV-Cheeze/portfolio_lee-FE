"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const PAGE_SIZE = 8;

const initialNotifications: NotificationItem[] = [];

function formatRelative(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [items]
  );

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (isLoadingMore) return;
        if (visibleCount >= items.length) return;

        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((c) => Math.min(items.length, c + PAGE_SIZE));
          setIsLoadingMore(false);
        }, 500);
      },
      { root: panelRef.current, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [open, isLoadingMore, visibleCount, items.length]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative" data-testid="tab-notifications">
      <button
        type="button"
        data-testid="button-notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors duration-200"
        aria-label="알림"
      >
        <Bell className="w-4 h-4 text-foreground" />
        {unreadCount > 0 && (
          <span
            data-testid="badge-notifications"
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center shadow"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-glass-border bg-glass/90 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          data-testid="modal-notifications"
          role="dialog"
          aria-label="알림 목록"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground" data-testid="text-notifications-title">
                알림
              </span>
              {unreadCount > 0 ? (
                <span
                  className="text-[11px] text-muted-foreground"
                  data-testid="text-notifications-unread"
                >
                  {unreadCount} unread
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground" data-testid="text-notifications-none">
                  모두 확인됨
                </span>
              )}
            </div>

            <button
              type="button"
              data-testid="button-notifications-markall"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-muted/70 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              모두 읽음
            </button>
          </div>

          <div
            className="max-h-[420px] overflow-auto"
            data-testid="list-notifications"
          >
            {visibleItems.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground" data-testid="text-notifications-empty">
                알림이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-glass-border">
                {visibleItems.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    data-testid={`row-notification-${n.id}`}
                    className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-transparent" : "bg-primary"}`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-notification-title-${n.id}`}>
                              {n.title}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0" data-testid={`text-notification-time-${n.id}`}>
                            {formatRelative(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2" data-testid={`text-notification-message-${n.id}`}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-10" data-testid="sentinel-notifications" />

            {isLoadingMore && (
              <div className="px-4 py-3 text-xs text-muted-foreground" data-testid="status-notifications-loading">
                불러오는 중...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
