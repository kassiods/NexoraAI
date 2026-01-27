"use client";

import { useEffect, useMemo, useState } from 'react';
import { notificationService } from '@/services/notification-service';
import { useRequireProfile } from '@/hooks/use-require-profile';
import type { NotificationItem } from '@/types/notification';

export default function NotificationsPage() {
  const { user, loading } = useRequireProfile();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    notificationService.listByUser(user.uid).then(setNotifications);
  }, [user]);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAll = async () => {
    await Promise.all(notifications.filter((n) => !n.read).map((n) => notificationService.markAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'ontem';
    if (days < 7) return `há ${days}d`;
    const weeks = Math.round(days / 7);
    return `há ${weeks}sem`;
  };

  const groupedNotifications = useMemo(() => {
    const now = Date.now();
    const groups: Record<string, NotificationItem[]> = { Hoje: [], 'Esta semana': [], 'Mais antigas': [] };
    notifications
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((item) => {
        const days = (now - item.createdAt) / (1000 * 60 * 60 * 24);
        const bucket = days < 1 ? 'Hoje' : days < 7 ? 'Esta semana' : 'Mais antigas';
        groups[bucket].push(item);
      });
    return [
      { label: 'Hoje', items: groups['Hoje'] },
      { label: 'Esta semana', items: groups['Esta semana'] },
      { label: 'Mais antigas', items: groups['Mais antigas'] }
    ];
  }, [notifications]);

  const hasNotifications = groupedNotifications.some((group) => group.items.length > 0);

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Atualizações</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Notificações</h1>
          <p className="text-sm text-[var(--text-secondary)]">Acompanhe interações, convites e atualizações relevantes.</p>
        </div>
        {hasNotifications && (
          <button
            onClick={markAll}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {!hasNotifications && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-7 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)]">Nenhuma notificação ainda</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Quando alguém comentar em seus projetos, responder seu feedback ou te convidar para um hub, tudo aparecerá aqui.
            </p>
            <p className="mt-3 text-xs font-semibold text-[var(--text-secondary)]">Comece participando de hubs ou publicando uma ideia.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-5 text-sm text-[var(--text-primary)]">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Tipos de notificações que você verá aqui:</p>
            <div className="mt-3 space-y-1.5 text-[var(--text-primary)]">
              <p>Comentários em projetos</p>
              <p>Convites para hubs</p>
              <p>Respostas ao seu feedback</p>
              <p>Atualizações de hubs que você participa</p>
            </div>
          </div>
        </div>
      )}

      {hasNotifications && (
        <div className="space-y-5">
          {groupedNotifications.map((group) =>
            group.items.length ? (
              <section key={group.label} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{group.label}</p>
                <div className="space-y-2.5">
                  {group.items.map((n) => {
                    const isUnread = !n.read;
                    const typeBadge = n.type === 'comment' ? 'C' : n.type === 'invite' ? 'I' : n.type === 'reply' ? 'R' : 'U';
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`cursor-pointer rounded-2xl border border-[var(--border)] px-4 py-4 transition ${
                          isUnread ? 'bg-[var(--bg-surface-hover)]' : 'bg-[var(--bg-surface)] opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)]">
                            {typeBadge}
                          </span>
                          <div className="flex-1 space-y-1.5">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{n.description}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                              <span>{formatRelativeTime(n.createdAt)}</span>
                              <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                              <span className={isUnread ? 'text-[var(--text-primary)]' : ''}>{isUnread ? 'Não lida' : 'Lida'}</span>
                            </div>
                          </div>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}

      <p className="text-xs text-[var(--text-secondary)]">Sua atividade na comunidade será refletida aqui.</p>
    </div>
  );
}
