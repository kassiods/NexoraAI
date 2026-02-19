"use client";

import { useEffect, useMemo, useState } from 'react';
import { moderationService } from '@/services/moderation-service';
import { userService } from '@/services/user-service';
import type { Report } from '@/types/report';
import type { UserProfile } from '@/types/user';
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

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, { action: string; days?: number; note?: string }>>({});
  const [profiles, setProfiles] = useState<Record<string, UserProfile | null>>({});

  useEffect(() => {
    const load = async () => {
      const data = await moderationService.listReports();
      setReports(data);
      const ids = Array.from(new Set(data.flatMap((r) => [r.reporterId, r.reportedUserId].filter(Boolean) as string[])));
      if (ids.length === 0) return;
      const entries = await Promise.all(ids.map(async (id) => [id, await userService.getById(id)] as const));
      const map: Record<string, UserProfile | null> = {};
      entries.forEach(([id, profile]) => {
        map[id] = profile;
      });
      setProfiles(map);
    };
    load();
  }, []);

  const sorted = useMemo(
    () =>
      reports
        .slice()
        .sort((a, b) => (a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1))
        .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    [reports]
  );

  const pendingReports = useMemo(() => sorted.filter((r) => r.status === 'pending'), [sorted]);
  const resolvedReports = useMemo(() => sorted.filter((r) => r.status === 'resolved'), [sorted]);

  const handleResolve = async (id: string) => {
    const selected = actionState[id] ?? { action: '', days: 7, note: '' };

    if (!selected.action) {
      setFeedback('Selecione um nível de ação antes de confirmar.');
      return;
    }

    const actionLabel = (() => {
      if (selected.action === 'severe-ban') return 'Conta banida permanentemente';
      if (selected.action === 'moderate-comments') return `Comentários bloqueados por ${selected.days ?? 7} dias`;
      if (selected.action === 'moderate-posts') return `Posts bloqueados por ${selected.days ?? 7} dias`;
      if (selected.action === 'none') return 'Resolvido sem ação punitiva';
      return 'Ação registrada';
    })();

    const requiresNote = selected.action === 'severe-ban' || selected.action === 'moderate-comments' || selected.action === 'moderate-posts';
    const requiresDays = selected.action === 'moderate-comments' || selected.action === 'moderate-posts';

    if (requiresNote && !selected.note?.trim()) {
      setFeedback('Inclua uma nota do administrador para ações moderadas ou graves.');
      return;
    }

    if (requiresDays && (!selected.days || selected.days < 1)) {
      setFeedback('Defina a duração da restrição em dias.');
      return;
    }

    const confirmMessage =
      selected.action === 'severe-ban'
        ? 'Confirmar banimento permanente?'
        : selected.action === 'moderate-comments'
          ? `Bloquear comentários por ${selected.days ?? 7} dias?`
          : selected.action === 'moderate-posts'
            ? `Bloquear posts por ${selected.days ?? 7} dias?`
            : 'Marcar como resolvido sem ação?';

    if (!window.confirm(confirmMessage)) return;

    await moderationService.resolveReport(id, actionLabel, selected.note?.trim());
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved', resolutionAction: actionLabel, resolutionNote: selected.note?.trim() } : r))
    );
    setFeedback(`Relatório resolvido: ${actionLabel}`);
  };

  const labelForUser = (uid?: string) => {
    if (!uid) return 'N/A';
    const profile = profiles[uid];
    return profile?.displayName || profile?.username || profile?.email || uid;
  };

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user || user.role !== 'admin') return <p className="text-sm text-[var(--text-secondary)]">Acesso restrito.</p>;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Admin</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Relatórios</h1>
        <p className="text-sm text-[var(--text-secondary)]">Revise sinalizações de conteúdo e usuários.</p>
      </div>

      {feedback && <p className="text-sm text-[var(--text-secondary)]">{feedback}</p>}

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <p className="font-semibold uppercase tracking-[0.16em]">Pendentes</p>
            <span>{pendingReports.length} itens</span>
          </div>

          {pendingReports.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">Nenhuma denúncia pendente.</div>
          )}

          {pendingReports.map((report) => {
            const highlight = report.status === 'pending';
            const selected = actionState[report.id] ?? { action: '', days: 7, note: '' };
            const setAction = (action: string) =>
              setActionState((prev) => ({ ...prev, [report.id]: { action, days: prev[report.id]?.days ?? 7, note: prev[report.id]?.note ?? '' } }));
            const setDays = (days: number) =>
              setActionState((prev) => ({ ...prev, [report.id]: { action: prev[report.id]?.action ?? 'moderate-comments', days, note: prev[report.id]?.note ?? '' } }));
            const setNote = (note: string) =>
              setActionState((prev) => ({ ...prev, [report.id]: { action: prev[report.id]?.action ?? 'none', days: prev[report.id]?.days ?? 7, note } }));

            return (
              <div
                key={report.id}
                className={`space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 ${highlight ? 'shadow-[0_0_0_1px_var(--action)]/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{report.targetType}</p>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{report.summary ?? report.reason}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{report.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>Reportado por</span>
                      <span className="text-[var(--text-primary)]">{labelForUser(report.reporterId)}</span>
                      {report.reportedUserId && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                          <span>Alvo</span>
                          <span className="text-[var(--text-primary)]">{labelForUser(report.reportedUserId)}</span>
                        </>
                      )}
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span>{report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span className="text-[var(--text-primary)]">Target: {report.targetId}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)]">Pendente</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Decisão do admin</p>

                  <div className="space-y-2">
                    <p className="text-sm text-[var(--text-primary)] font-semibold">Qual nível de ação deseja aplicar?</p>
                    <label className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition ${selected.action === 'none' ? 'border-[var(--border-strong)] bg-[color:rgba(255,255,255,0.02)]' : 'border-[var(--border)]'}`}>
                      <input type="radio" name={`level-${report.id}`} checked={selected.action === 'none'} onChange={() => setAction('none')} className="mt-1" />
                      <div>
                        <p className="font-semibold">Nenhuma ação</p>
                        <p className="text-xs text-[var(--text-secondary)]">Use quando não há violação clara ou já corrigida.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition ${selected.action.startsWith('moderate') ? 'border-[var(--action)] bg-[color:rgba(255,196,0,0.08)]' : 'border-[var(--border)]'}`}>
                      <input
                        type="radio"
                        name={`level-${report.id}`}
                        checked={selected.action === 'moderate-comments' || selected.action === 'moderate-posts'}
                        onChange={() => setAction('moderate-comments')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">Restrição temporária</p>
                        <p className="text-xs text-[var(--text-secondary)]">Para infrações médias ou reincidências leves.</p>
                        {selected.action === 'moderate-comments' || selected.action === 'moderate-posts' ? (
                          <div className="mt-3 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                              <label className={`flex items-center gap-2 rounded-md border px-2 py-1 transition ${selected.action === 'moderate-comments' ? 'border-[var(--action)]' : 'border-[var(--border)]'}`}>
                                <input type="radio" name={`moderate-type-${report.id}`} checked={selected.action === 'moderate-comments'} onChange={() => setAction('moderate-comments')} />
                                <span>Bloquear comentários</span>
                              </label>
                              <label className={`flex items-center gap-2 rounded-md border px-2 py-1 transition ${selected.action === 'moderate-posts' ? 'border-[var(--action)]' : 'border-[var(--border)]'}`}>
                                <input type="radio" name={`moderate-type-${report.id}`} checked={selected.action === 'moderate-posts'} onChange={() => setAction('moderate-posts')} />
                                <span>Bloquear posts</span>
                              </label>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                              <span>Dias:</span>
                              <input
                                type="number"
                                min={1}
                                max={90}
                                value={selected.days ?? 7}
                                onChange={(e) => setDays(Number(e.target.value) || 1)}
                                className="w-20 rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[var(--text-primary)]"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </label>

                    <label className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition ${selected.action === 'severe-ban' ? 'border-[var(--action)] bg-[color:rgba(255,64,64,0.08)]' : 'border-[var(--border)]'}`}>
                      <input type="radio" name={`level-${report.id}`} checked={selected.action === 'severe-ban'} onChange={() => setAction('severe-ban')} className="mt-1" />
                      <div>
                        <p className="font-semibold">Ação grave</p>
                        <p className="text-xs text-[var(--text-secondary)]">Para abuso severo ou múltiplas violações graves.</p>
                      </div>
                    </label>
                  </div>

                  {(selected.action === 'moderate-comments' || selected.action === 'moderate-posts' || selected.action === 'severe-ban') && (
                    <label className="space-y-1 text-sm text-[var(--text-primary)]">
                      <span className="text-[var(--text-secondary)]">Nota do administrador (obrigatória para restrição ou banimento)</span>
                      <textarea
                        value={selected.note ?? ''}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
                        placeholder="Contextualize a decisão (ex.: reincidência, gravidade, evidências)."
                      />
                    </label>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-[var(--text-primary)]">
                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={!selected.action || ((selected.action === 'moderate-comments' || selected.action === 'moderate-posts') && (!selected.days || selected.days < 1)) || ((selected.action === 'moderate-comments' || selected.action === 'moderate-posts' || selected.action === 'severe-ban') && !selected.note?.trim())}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 transition hover:bg-[var(--bg-surface)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Confirmar decisão
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <p className="font-semibold uppercase tracking-[0.16em]">Resolvidas</p>
            <span>{resolvedReports.length} itens</span>
          </div>

          {resolvedReports.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">Nenhuma denúncia resolvida ainda.</div>
          )}

          {resolvedReports.map((report) => {
            const statusLabel = report.resolutionAction?.toLowerCase().includes('banida') ? 'Banimento' : report.resolutionAction ? 'Ação aplicada' : 'Resolvida';
            return (
              <div key={report.id} className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{report.targetType}</p>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{report.summary ?? report.reason}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{report.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>Reportado por</span>
                      <span className="text-[var(--text-primary)]">{labelForUser(report.reporterId)}</span>
                      {report.reportedUserId && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                          <span>Alvo</span>
                          <span className="text-[var(--text-primary)]">{labelForUser(report.reportedUserId)}</span>
                        </>
                      )}
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span>{report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span className="text-[var(--text-primary)]">Target: {report.targetId}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)]">{statusLabel}</span>
                    {report.resolutionAction && <div className="mt-1 text-[var(--text-secondary)]">{report.resolutionAction}</div>}
                    {report.resolutionNote && <div className="mt-1 text-[11px] text-[var(--text-secondary)]">Nota: {report.resolutionNote}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
