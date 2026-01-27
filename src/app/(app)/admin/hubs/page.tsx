"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { hubService } from '@/services/hub-service';
import { mockUsers } from '@/data/mock/users';
import type { HubRequest } from '@/types/hub';
import { useAuth } from '@/hooks/use-auth';

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / (1000 * 60)));
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ontem';
  return `há ${days}d`;
}

export default function AdminHubsPage() {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState<HubRequest[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    hubService.listHubRequests().then(setRequests);
  }, []);

  const sorted = useMemo(() => requests.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)), [requests]);

  const handleAction = async (id: string, status: HubRequest['status']) => {
    const confirmText = status === 'approved' ? 'Aprovar este hub?' : 'Rejeitar este hub?';
    if (!window.confirm(confirmText)) return;
    const reason = status === 'rejected' ? window.prompt('Motivo (opcional):') ?? undefined : undefined;
    await hubService.updateRequestStatus(id, status, reason);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setFeedback(status === 'approved' ? 'Hub aprovado e publicado (mock).' : 'Solicitação rejeitada (mock).');
  };

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user || user.role !== 'admin') return <p className="text-sm text-[var(--text-secondary)]">Acesso restrito.</p>;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Admin</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Solicitações de Hub</h1>
        <p className="text-sm text-[var(--text-secondary)]">Analise e aprove ou rejeite pedidos de criação de hubs.</p>
      </div>

      {feedback && <p className="text-sm text-[var(--text-secondary)]">{feedback}</p>}

      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">
            Nenhuma solicitação pendente.
          </div>
        )}

        {sorted.map((req) => {
          const requester = mockUsers[req.requesterId] ?? { displayName: req.requesterId, username: `@${req.requesterId}` };
          return (
            <div
              key={req.id}
              className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{req.category}</p>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{req.name}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{req.description}</p>
                  {req.objective && <p className="text-sm text-[var(--text-primary)]">Objetivo: {req.objective}</p>}
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Link
                      href={`/profile/${(requester.username ?? '').replace('@', '')}`}
                      className="text-[var(--text-primary)] transition hover:text-[var(--action-hover)]"
                    >
                      {requester.displayName ?? requester.username}
                    </Link>
                    <Link
                      href={`/profile/${(requester.username ?? '').replace('@', '')}`}
                      className="transition hover:text-[var(--action-hover)]"
                    >
                      {requester.username}
                    </Link>
                    <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                    <span>{req.createdAt ? formatRelativeTime(req.createdAt) : 'há pouco'}</span>
                  </div>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">{req.status === 'pending' ? 'Pendente' : req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</span>
              </div>

              {req.status === 'pending' && (
                <div className="flex flex-wrap gap-2 text-sm text-[var(--text-primary)]">
                  <button
                    onClick={() => handleAction(req.id, 'approved')}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 transition hover:bg-[var(--bg-surface-hover)]"
                  >
                    Aprovar hub
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 transition hover:bg-[var(--bg-surface-hover)]"
                  >
                    Rejeitar hub
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
