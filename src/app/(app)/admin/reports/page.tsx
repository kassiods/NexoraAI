"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { moderationService } from '@/services/moderation-service';
import type { Report } from '@/types/report';
import { mockUsers } from '@/data/mock/users';
import { mockPosts, mockComments } from '@/data/mock/posts';
import { mockHubs } from '@/data/mock/hubs';
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

  useEffect(() => {
    moderationService.listReports().then(setReports);
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
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">
              Nenhuma denúncia pendente.
            </div>
          )}

          {pendingReports.map((report) => {
          const reporter = mockUsers[report.reporterId] ?? { displayName: report.reporterId, username: `@${report.reporterId}` };
          const targetUser = report.reportedUserId ? mockUsers[report.reportedUserId] : undefined;
          const highlight = report.status === 'pending';
          const selected = actionState[report.id] ?? { action: '', days: 7, note: '' };

          const setAction = (action: string) =>
            setActionState((prev) => ({ ...prev, [report.id]: { action, days: prev[report.id]?.days ?? 7, note: prev[report.id]?.note ?? '' } }));

          const setDays = (days: number) =>
            setActionState((prev) => ({ ...prev, [report.id]: { action: prev[report.id]?.action ?? 'moderate-comments', days, note: prev[report.id]?.note ?? '' } }));

          const setNote = (note: string) =>
            setActionState((prev) => ({ ...prev, [report.id]: { action: prev[report.id]?.action ?? 'none', days: prev[report.id]?.days ?? 7, note } }));

          const typeLabel = report.targetType === 'post' ? 'Post' : report.targetType === 'comment' ? 'Comentário' : 'Usuário';

          const statusLabel = (() => {
            if (report.status === 'pending') return 'Pendente';
            if (report.resolutionAction?.toLowerCase().includes('banida')) return 'Banimento';
            if (report.resolutionAction) return 'Ação aplicada';
            return 'Resolvida';
          })();

          const post = report.targetType === 'post' ? mockPosts.find((p) => p.id === report.targetId) : undefined;
          const comment = report.targetType === 'comment' ? mockComments.find((c) => c.id === report.targetId) : undefined;
          const postForComment = comment ? mockPosts.find((p) => p.id === comment.postId) : undefined;
          const hub = post?.hubId ? mockHubs.find((h) => h.id === post.hubId) : postForComment?.hubId ? mockHubs.find((h) => h.id === postForComment.hubId) : undefined;
          const contentAuthorId = comment?.authorId ?? post?.authorId ?? report.reportedUserId;
          const contentAuthor = contentAuthorId ? mockUsers[contentAuthorId] : undefined;
          const contentText = comment?.content ?? post?.content ?? 'Conteúdo não localizado (mock).';
          const contentLink = hub ? { pathname: '/hubs/[id]', query: { id: hub.id } } : null;
          const peerReports = report.reportedUserId ? reports.filter((r) => r.reportedUserId === report.reportedUserId) : [];
          const resolvedHistory = peerReports.filter((r) => r.status === 'resolved' && r.resolutionAction);

          return (
            <div
              key={report.id}
              className={`space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 ${highlight ? 'shadow-[0_0_0_1px_var(--action)]/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{typeLabel}</p>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{report.summary ?? report.reason}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{report.reason}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span>Reportado por</span>
                    <Link
                      href={`/profile/${(reporter.username ?? '').replace('@', '')}`}
                      className="text-[var(--text-primary)] hover:text-[var(--action-hover)]"
                    >
                      {reporter.displayName ?? reporter.username}
                    </Link>
                    <Link
                      href={`/profile/${(reporter.username ?? '').replace('@', '')}`}
                      className="hover:text-[var(--action-hover)]"
                    >
                      {reporter.username}
                    </Link>
                    {targetUser && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                        <span>Alvo</span>
                        <Link
                          href={`/profile/${(targetUser.username ?? '').replace('@', '')}`}
                          className="text-[var(--text-primary)] hover:text-[var(--action-hover)]"
                        >
                          {targetUser.displayName ?? targetUser.username}
                        </Link>
                        <Link href={`/profile/${(targetUser.username ?? '').replace('@', '')}`} className="hover:text-[var(--action-hover)]">
                          {targetUser.username}
                        </Link>
                      </>
                    )}
                    <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                    <span>{report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)]">{statusLabel}</span>
                  {report.resolutionAction && (
                    <div className="mt-1 text-[var(--text-secondary)]">{report.resolutionAction}</div>
                  )}
                  {report.resolutionNote && (
                    <div className="mt-1 text-[11px] text-[var(--text-secondary)]">Nota: {report.resolutionNote}</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Contexto</span>
                  {hub && (
                    <span>
                      Hub: <Link href={`/hubs/${hub.id}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">{hub.name}</Link>
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] whitespace-pre-wrap">{contentText}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    {contentAuthor && (
                      <>
                        <span>Autor do conteúdo</span>
                        <Link href={`/profile/${(contentAuthor.username ?? '').replace('@', '')}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">
                          {contentAuthor.displayName ?? contentAuthor.username}
                        </Link>
                        <Link href={`/profile/${(contentAuthor.username ?? '').replace('@', '')}`} className="hover:text-[var(--action-hover)]">
                          {contentAuthor.username}
                        </Link>
                        <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      </>
                    )}
                    <span>Denúncia criada {report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                    {contentLink && (
                      <Link href={contentLink} className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)]">
                        Ver no hub
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {targetUser && (
                <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    Histórico do usuário (mock)
                    <span className="text-[10px] text-[var(--text-secondary)]">{peerReports.length} denúncias</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)]">
                    <p>Denúncias registradas: {peerReports.length}</p>
                    <p>Ações anteriores: {resolvedHistory.length > 0 ? resolvedHistory.map((r) => r.resolutionAction ?? 'Ação aplicada').join(' · ') : 'Nenhuma ação registrada'}</p>
                    <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[11px]">
                      Estrutura pronta para conectar ao backend e exibir histórico real de moderação.
                    </p>
                  </div>
                </details>
              )}

              {report.status === 'pending' && (
                <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Decisão do admin</p>

                  <div className="space-y-2">
                    <p className="text-sm text-[var(--text-primary)] font-semibold">Qual nível de ação deseja aplicar?</p>
                    <label className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition ${selected.action === 'none' ? 'border-[var(--border-strong)] bg-[color:rgba(255,255,255,0.02)]' : 'border-[var(--border)]'}`}>
                      <input
                        type="radio"
                        name={`level-${report.id}`}
                        checked={selected.action === 'none'}
                        onChange={() => setAction('none')}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">Nenhuma ação</p>
                        <p className="text-xs text-[var(--text-secondary)]">Use quando não há violação clara ou já corrigida.</p>
                        {selected.action === 'none' && <p className="text-[11px] text-[var(--text-secondary)]">Confirma apenas o fechamento do caso.</p>}
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
                        {selected.action.startsWith('moderate') && <p className="text-[11px] text-[var(--text-secondary)]">Bloqueia recursos por período definido.</p>}
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
                      <input
                        type="radio"
                        name={`level-${report.id}`}
                        checked={selected.action === 'severe-ban'}
                        onChange={() => setAction('severe-ban')}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">Ação grave</p>
                        <p className="text-xs text-[var(--text-secondary)]">Para abuso severo ou múltiplas violações graves.</p>
                        {selected.action === 'severe-ban' && <p className="text-[11px] text-[var(--text-secondary)]">Remove acesso permanentemente.</p>}
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

                  <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
                    A decisão será registrada no histórico de moderação (mock).
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)]">Resumo da decisão</p>
                    <div className="mt-1 space-y-1">
                      <p>Alvo: {targetUser ? targetUser.username : 'Usuário não identificado'}</p>
                      <p>Ação: {selected.action ? (selected.action === 'severe-ban' ? 'Banimento permanente' : selected.action === 'moderate-comments' ? 'Bloqueio de comentários' : selected.action === 'moderate-posts' ? 'Bloqueio de posts' : 'Sem ação') : 'Selecione uma opção'}</p>
                      {(selected.action === 'moderate-comments' || selected.action === 'moderate-posts') && <p>Duração: {selected.days ?? 0} dia(s)</p>}
                    </div>
                  </div>

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
              )}
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
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">
              Nenhuma denúncia resolvida ainda.
            </div>
          )}

          {resolvedReports.map((report) => {
            const reporter = mockUsers[report.reporterId] ?? { displayName: report.reporterId, username: `@${report.reporterId}` };
            const targetUser = report.reportedUserId ? mockUsers[report.reportedUserId] : undefined;
            const selected = actionState[report.id] ?? { action: '', days: 7, note: '' };
            const typeLabel = report.targetType === 'post' ? 'Post' : report.targetType === 'comment' ? 'Comentário' : 'Usuário';
            const statusLabel = (() => {
              if (report.status === 'pending') return 'Pendente';
              if (report.resolutionAction?.toLowerCase().includes('banida')) return 'Banimento';
              if (report.resolutionAction) return 'Ação aplicada';
              return 'Resolvida';
            })();
            const post = report.targetType === 'post' ? mockPosts.find((p) => p.id === report.targetId) : undefined;
            const comment = report.targetType === 'comment' ? mockComments.find((c) => c.id === report.targetId) : undefined;
            const postForComment = comment ? mockPosts.find((p) => p.id === comment.postId) : undefined;
            const hub = post?.hubId ? mockHubs.find((h) => h.id === post.hubId) : postForComment?.hubId ? mockHubs.find((h) => h.id === postForComment.hubId) : undefined;
            const contentAuthorId = comment?.authorId ?? post?.authorId ?? report.reportedUserId;
            const contentAuthor = contentAuthorId ? mockUsers[contentAuthorId] : undefined;
            const contentText = comment?.content ?? post?.content ?? 'Conteúdo não localizado (mock).';
            const contentLink = hub ? { pathname: '/hubs/[id]', query: { id: hub.id } } : null;
            const peerReports = report.reportedUserId ? reports.filter((r) => r.reportedUserId === report.reportedUserId) : [];
            const resolvedHistory = peerReports.filter((r) => r.status === 'resolved' && r.resolutionAction);

            return (
              <div key={report.id} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{typeLabel}</p>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{report.summary ?? report.reason}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">{report.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>Reportado por</span>
                      <Link href={`/profile/${(reporter.username ?? '').replace('@', '')}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">
                        {reporter.displayName ?? reporter.username}
                      </Link>
                      <Link href={`/profile/${(reporter.username ?? '').replace('@', '')}`} className="hover:text-[var(--action-hover)]">
                        {reporter.username}
                      </Link>
                      {targetUser && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                          <span>Alvo</span>
                          <Link href={`/profile/${(targetUser.username ?? '').replace('@', '')}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">
                            {targetUser.displayName ?? targetUser.username}
                          </Link>
                          <Link href={`/profile/${(targetUser.username ?? '').replace('@', '')}`} className="hover:text-[var(--action-hover)]">
                            {targetUser.username}
                          </Link>
                        </>
                      )}
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span>{report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-secondary)]">{statusLabel}</span>
                    {report.resolutionAction && <div className="mt-1 text-[var(--text-secondary)]">{report.resolutionAction}</div>}
                    {report.resolutionNote && <div className="mt-1 text-[11px] text-[var(--text-secondary)]">Nota: {report.resolutionNote}</div>}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Contexto</span>
                    {hub && (
                      <span>
                        Hub: <Link href={`/hubs/${hub.id}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">{hub.name}</Link>
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] whitespace-pre-wrap">{contentText}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      {contentAuthor && (
                        <>
                          <span>Autor do conteúdo</span>
                          <Link href={`/profile/${(contentAuthor.username ?? '').replace('@', '')}`} className="text-[var(--text-primary)] hover:text-[var(--action-hover)]">
                            {contentAuthor.displayName ?? contentAuthor.username}
                          </Link>
                          <Link href={`/profile/${(contentAuthor.username ?? '').replace('@', '')}`} className="hover:text-[var(--action-hover)]">
                            {contentAuthor.username}
                          </Link>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                        </>
                      )}
                      <span>Denúncia criada {report.createdAt ? formatRelativeTime(report.createdAt) : 'há pouco'}</span>
                      {contentLink && (
                        <Link href={contentLink} className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)]">
                          Ver no hub
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {targetUser && (
                  <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-3 text-sm text-[var(--text-primary)]">
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      Histórico do usuário (mock)
                      <span className="text-[10px] text-[var(--text-secondary)]">{peerReports.length} denúncias</span>
                    </summary>
                    <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)]">
                      <p>Denúncias registradas: {peerReports.length}</p>
                      <p>Ações anteriores: {resolvedHistory.length > 0 ? resolvedHistory.map((r) => r.resolutionAction ?? 'Ação aplicada').join(' · ') : 'Nenhuma ação registrada'}</p>
                      <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[11px]">
                        Estrutura pronta para conectar ao backend e exibir histórico real de moderação.
                      </p>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
