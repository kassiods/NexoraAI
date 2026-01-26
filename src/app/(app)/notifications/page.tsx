"use client";

import { useEffect, useState } from 'react';
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

  if (loading) return <p className="text-sm text-[#9CA3AF]">Carregando...</p>;
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Atualizações</p>
          <h1 className="text-2xl font-semibold text-white">Notificações</h1>
          <p className="text-sm text-[#9CA3AF]">Acompanhe aprovações e comentários.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAll}
            className="rounded-full border border-white/10 bg-[#0F1117] px-4 py-2 text-xs font-semibold text-white transition hover:border-brand-600 hover:scale-[1.01]"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      <div className="space-y-3">
        {notifications.length === 0 && <p className="text-sm text-[#9CA3AF]">Nenhuma notificação.</p>}
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`cursor-pointer rounded-2xl border border-white/6 bg-[#16161D] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:scale-[1.01] hover:border-brand-600 ${n.read ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="text-sm text-[#9CA3AF]">{n.description}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="rounded-lg border border-[#26262E] px-3 py-1 text-xs font-semibold text-[#E5E7EB] transition hover:border-brand-700 hover:text-white"
                >
                  Marcar como lida
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-[#9CA3AF]">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
