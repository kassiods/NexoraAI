"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Sparkles, Compass, PenLine } from 'lucide-react';
import { useRequireProfile } from '@/hooks/use-require-profile';
import { hubService } from '@/services/hub-service';
import { postService } from '@/services/post-service';
import { userService } from '@/services/user-service';
import { moderationService } from '@/services/moderation-service';
import type { Hub } from '@/types/hub';
import type { Post } from '@/types/post';
import type { UserProfile } from '@/types/user';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityCard } from '@/components/dashboard/activity-card';
import { EmptyFeedState } from '@/components/dashboard/empty-feed-state';
import { HubMiniCard } from '@/components/dashboard/hub-mini-card';
import { ReportModal } from '@/components/ui/report-modal';

export default function DashboardPage() {
  const { user, loading } = useRequireProfile();
  const [userHubs, setUserHubs] = useState<Hub[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, UserProfile | null>>({});
  const [allHubs, setAllHubs] = useState<Hub[]>([]);
  const [visibleFeed, setVisibleFeed] = useState(5);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerNotice, setComposerNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    hubService.getUserHubs(user.uid).then(setUserHubs);
    hubService.listHubs().then(setAllHubs);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const hubIds = user.hubs ?? [];
    postService.listFeedForUser(hubIds).then(setFeed);
  }, [user]);

  useEffect(() => {
    const loadAuthors = async () => {
      const uniqueIds = Array.from(new Set(feed.map((p) => p.authorId)));
      const entries = await Promise.all(uniqueIds.map(async (id) => [id, await userService.getById(id)] as const));
      const map: Record<string, UserProfile | null> = {};
      entries.forEach(([id, profile]) => {
        map[id] = profile;
      });
      setAuthors(map);
    };
    if (feed.length > 0) {
      loadAuthors();
    }
  }, [feed]);

  useEffect(() => {
    if (feed.length === 0) return;
    const likeState: Record<string, boolean> = {};
    feed.forEach((p) => {
      likeState[p.id] = !!p.likes?.includes(user?.uid ?? '');
    });
    setLiked(likeState);
  }, [feed, user?.uid]);

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user) return null;

  const hubName = (hubId: string) => allHubs.find((h) => h.id === hubId)?.name ?? hubId;

  const authorMeta = (id: string) => {
    const profile = authors[id];
    if (!profile) return { label: id, slug: undefined };
    const label = profile.displayName ?? profile.username ?? profile.email ?? id;
    const slug = profile.username ? profile.username.replace('@', '') : undefined;
    return { label, slug };
  };

  const formatTimeAgo = (dateValue: string | number) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes <= 0) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days} dia${days > 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `há ${weeks} sem`;
    const months = Math.floor(days / 30);
    if (months < 12) return `há ${months} m`; // aproximação simples
    const years = Math.floor(days / 365);
    return `há ${years} a`;
  };

  const formatCommentCount = (post: Post) => {
    const base = (post.id.length + post.content.length) % 4;
    return base;
  };

  const handleCompose = () => {
    setComposerNotice('Publicação rápida chega em breve. Enquanto isso, compartilhe nos hubs e peça feedback.');
    setComposerText('');
    setTimeout(() => setComposerNotice(null), 2600);
  };

  const handleLike = (postId: string) => {
    setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleReport = async (postId: string) => {
    if (!user) return;
    setReportTarget(postId);
  };

  const submitReport = async (reason: string, details: string) => {
    if (!user || !reportTarget) return;
    setReporting(true);
    const composed = details ? `${reason} — ${details}` : reason;
    await moderationService.reportContent(reportTarget, 'post', composed, user.uid);
    setReporting(false);
    setReportTarget(null);
    setReportNotice('Denúncia enviada para moderação.');
    setTimeout(() => setReportNotice(null), 2500);
  };

  const visiblePosts = feed.slice(0, visibleFeed);

  const suggestedHubs = allHubs.slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Início</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Início</h1>
            <p className="text-sm text-[var(--text-secondary)]">Veja o que as pessoas estão construindo hoje. Olá, {user.displayName ?? user.email}.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/hubs"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--action)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)]"
            >
              <Compass className="h-4 w-4" /> Explorar hubs
            </Link>
            <Link
              href="#composer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
            >
              <PenLine className="h-4 w-4" /> Criar post
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:col-span-8">
          <div id="composer" className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--action)] text-base font-semibold text-black ring-1 ring-[var(--border)]">
                {(user.displayName ?? user.email ?? 'Você').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">Compartilhe progresso com a comunidade</p>
                  <p className="text-sm text-[var(--text-secondary)]">No que você está trabalhando hoje? Travei em algo? Pede feedback aqui.</p>
                </div>
                <div className="space-y-2">
                  <textarea
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder="No que você está trabalhando hoje?"
                    className="min-h-[110px] w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-hover)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--action)]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[var(--text-secondary)]">Esse espaço é o centro social da Nexora.</span>
                    <button
                      type="button"
                      onClick={handleCompose}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--action)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)]"
                    >
                      Compartilhar progresso
                    </button>
                  </div>
                  {composerNotice && <p className="text-xs text-[var(--text-secondary)]">{composerNotice}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[var(--text-primary)]">O que está rolando nos seus hubs</p>
                <p className="text-xs text-[var(--text-secondary)]">Novidades das comunidades que você segue</p>
              </div>
              <Link href="/hubs" className="text-sm font-semibold text-[var(--action)] hover:text-[var(--action-hover)]">
                Explorar hubs
              </Link>
            </div>

            <div className="mt-2 space-y-5">
              {feed.length === 0 && <EmptyFeedState recommended={suggestedHubs} />}
              {visiblePosts.map((post) => {
                const { label, slug } = authorMeta(post.authorId);
                return (
                  <ActivityCard
                    key={post.id}
                    post={post}
                    authorName={label}
                    authorSlug={slug}
                    hubName={hubName(post.hubId)}
                    hubId={post.hubId}
                    createdLabel={formatTimeAgo(post.createdAt)}
                    likeCount={post.likes?.length ?? 0}
                    commentCount={formatCommentCount(post)}
                    liked={!!liked[post.id]}
                    onLike={handleLike}
                    onReport={handleReport}
                  />
                );
              })}
              {feed.length > visiblePosts.length && (
                <button
                  onClick={() => setVisibleFeed((prev) => Math.min(feed.length, prev + 3))}
                  className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
                >
                  Ver mais posts
                </button>
              )}
              {reportNotice && <p className="text-xs text-[var(--text-secondary)]">{reportNotice}</p>}
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Seu contexto</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link href="/hubs" className="transition hover:-translate-y-0.5">
                <StatCard label="Comunidades" value={userHubs.length ? `${userHubs.length} hubs ativos` : 'Entre em um hub'} hint="Onde você troca ideias" Icon={Activity} tone="indigo" />
              </Link>
              <Link href="/profile" className="transition hover:-translate-y-0.5">
                <StatCard label="Suas contribuições" value={feed.length ? `${feed.length} posts recentes` : 'Comece a compartilhar'} hint="Tudo o que você publica" Icon={Sparkles} tone="purple" />
              </Link>
              <Link href="/profile" className="transition hover:-translate-y-0.5">
                <StatCard
                  label="Seu perfil"
                  value={user.username ? 'Pronto para conexões' : 'Adicione um username'}
                  hint={user.username ? 'As pessoas te encontram fácil' : 'Fica mais fácil te marcar'}
                  Icon={ShieldCheck}
                  tone="teal"
                  highlight={!!user.username}
                />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Comunidades que você participa</p>
            <div className="mt-3 space-y-3">
              {userHubs.length === 0 && <p className="text-sm text-[var(--text-secondary)]">Ainda está quieto por aqui. Explore hubs para começar.</p>}
              {userHubs.map((hub) => (
                <HubMiniCard key={hub.id} hub={hub} />
              ))}
            </div>
          </div>
        </aside>
      </section>

      <ReportModal
        open={!!reportTarget}
        targetLabel="este post"
        onCancel={() => {
          setReportTarget(null);
          setReporting(false);
        }}
        onSubmit={submitReport}
        submitting={reporting}
      />
    </div>
  );
}
