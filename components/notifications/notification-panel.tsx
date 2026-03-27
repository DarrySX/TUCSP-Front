'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/lib/auth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_id: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  new_event:          '🎵',
  rsvp_registered:    '✅',
  attendance_present: '✓',
  attendance_late:    '⚠',
  attendance_absent:  '✗',
};

const TYPE_COLOR: Record<string, string> = {
  new_event:          'text-primary',
  rsvp_registered:    'text-green-600',
  attendance_present: 'text-green-600',
  attendance_late:    'text-amber-500',
  attendance_absent:  'text-red-600',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationPanel({ userId }: { userId: string }) {
  const [open, setOpen]               = useState(false);
  const [items, setItems]             = useState<Notification[]>([]);
  const [unread, setUnread]           = useState(0);
  const channelRef                    = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    channelRef.current = supabase
      .channel(`notif:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => [n, ...prev].slice(0, 50));
          setUnread((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [userId]);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    const list = (data ?? []) as Notification[];
    setItems(list);
    setUnread(list.filter((n) => !n.read).length);
  }

  async function markAllRead() {
    if (unread === 0) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-md hover:bg-secondary/50 transition"
        aria-label="Notificaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-100 p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-base">
                Notificaciones
                {unread > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full px-1.5">
                    {unread}
                  </span>
                )}
              </SheetTitle>

              {unread > 0 ? (
                <button
                  onClick={markAllRead}
                  className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md px-2.5 py-1.5 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Marcar todo leído
                </button>
              ) : items.length > 0 ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Al día
                </span>
              ) : null}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                <p className="text-sm">Sin notificaciones aún</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-3.5 flex gap-3 transition ${!n.read ? 'bg-primary/5' : ''}`}
                  >
                    <span className={`text-lg shrink-0 mt-0.5 ${TYPE_COLOR[n.type] ?? 'text-muted-foreground'}`}>
                      {TYPE_ICON[n.type] ?? '📌'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      {n.entity_id && (
                        <Link
                          href={`/dashboard/events/${n.entity_id}`}
                          onClick={() => setOpen(false)}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Ver evento →
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
