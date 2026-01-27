"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Sparkles, Compass } from 'lucide-react';
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

  const stats = [
    {
      label: 'Hubs ativos',
      value: userHubs.length,
      hint: 'Participando',
      icon: '🛰️'
    },
    {
      label: 'Posts no feed',
      value: feed.length,
      hint: 'Últimos 10',
      icon: '⚡'
    },
    {
      label: 'Perfil',
      value: user.username ? 'Completo' : 'Incompleto',
      hint: user.username ? 'Pronto para hubs' : 'Falta username',
      icon: '🛡️'
    }
  ];

  const hubName = (hubId: string) => allHubs.find((h) => h.id === hubId)?.name ?? hubId;

  const authorMeta = (id: string) => {
    const profile = authors[id];
    if (!profile) return { label: id, slug: undefined };
    const label = profile.displayName ?? profile.username ?? profile.email ?? id;
    const slug = profile.username ? profile.username.replace('@', '') : undefined;
    return { label, slug };
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
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Visão geral</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">Visão geral da sua atividade. Olá, {user.displayName ?? user.email}.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/hubs"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--action)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)]"
            >
              <Compass className="h-4 w-4" /> Explorar Hubs
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
            >
              Ajustar perfil
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Hubs ativos" value={userHubs.length} hint="Participando" Icon={Activity} tone="indigo" />
        <StatCard label="Posts no feed" value={feed.length} hint="Últimos 10" Icon={Sparkles} tone="purple" />
        <StatCard
          label="Perfil"
          value={user.username ? 'Completo' : 'Incompleto'}
          hint={user.username ? 'Pronto para hubs' : 'Falta username'}
          Icon={ShieldCheck}
          tone="teal"
          highlight={!!user.username}
        />
      </div>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Feed recente</p>
              <p className="text-xs text-[var(--text-secondary)]">Posts dos hubs que você segue</p>
            </div>
            <Link href="/hubs" className="text-sm font-semibold text-[var(--action)] hover:text-[var(--action-hover)]">
              Ver hubs
            </Link>
          </div>

          <div className="mt-4 space-y-4">
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
                  createdLabel={new Date(post.createdAt).toLocaleDateString()}
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
                Carregar mais
              </button>
            )}
            {reportNotice && <p className="text-xs text-[var(--text-secondary)]">{reportNotice}</p>}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Hubs em que você está</p>
            <div className="mt-3 space-y-3">
              {userHubs.length === 0 && <p className="text-sm text-[var(--text-secondary)]">Ainda não participa de hubs.</p>}
              {userHubs.map((hub) => (
                <HubMiniCard key={hub.id} hub={hub} />
              ))}
            </div>
          </div>
        </div>
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
