"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ThumbsUp } from 'lucide-react';
import type { Route } from 'next';
import { hubService } from '@/services/hub-service';
import { postService } from '@/services/post-service';
import { moderationService } from '@/services/moderation-service';
import { useAuth } from '@/hooks/use-auth';
import { mockUsers } from '@/data/mock/users';
import type { Hub } from '@/types/hub';
import type { Post, Comment } from '@/types/post';
import { ReportModal } from '@/components/ui/report-modal';

type HubPageProps = { params: { id: string } };

export default function HubPage({ params }: HubPageProps) {
  const { id } = params;
  const { user } = useAuth();
  const [hub, setHub] = useState<Hub | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const commentInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [visiblePosts, setVisiblePosts] = useState(4);
  const [postLikes, setPostLikes] = useState<Record<string, boolean>>({});
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'post' | 'comment'; label: string } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.max(1, Math.round(diff / (1000 * 60)));
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'ontem';
    if (days < 7) return `há ${days}d`;
    const weeks = Math.round(days / 7);
    return `há ${weeks}sem`;
  };

  const resolveUser = (uid: string) => {
    const profile = mockUsers[uid];
    if (!profile) {
      return {
        name: uid,
        username: `@${uid}`,
        avatar: uid.slice(0, 2).toUpperCase()
      };
    }
    return {
      name: profile.displayName || profile.email || uid,
      username: profile.username || `@${uid}`,
      avatar: (profile.displayName || uid).slice(0, 2).toUpperCase()
    };
  };

  useEffect(() => {
    hubService.getHub(id).then(setHub);
    postService.listByHub(id).then((data) => {
      setPosts(data.posts);
      setComments(data.comments);
    });
  }, [id]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    const created = await postService.createPost(id, user.uid, content.trim());
    setPosts((prev) => [created, ...prev]);
    setContent('');
  };

  const handleComment = async (postId: string) => {
    if (!user) return;
    const value = commentDrafts[postId]?.trim();
    if (!value) {
      commentInputs.current[postId]?.focus();
      return;
    }
    const created = await postService.addComment(postId, user.uid, value);
    setComments((prev) => [created, ...prev]);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleReportPost = (postId: string) => {
    if (!user) return;
    setReportTarget({ id: postId, type: 'post', label: 'este post' });
  };

  const handleReportComment = (commentId: string) => {
    if (!user) return;
    setReportTarget({ id: commentId, type: 'comment', label: 'este comentário' });
  };

  const submitReport = async (reason: string, details: string) => {
    if (!user || !reportTarget) return;
    setReporting(true);
    const composed = details ? `${reason} — ${details}` : reason;
    await moderationService.reportContent(reportTarget.id, reportTarget.type, composed, user.uid);
    setReporting(false);
    setReportTarget(null);
    setReportNotice('Denúncia enviada para moderação.');
    setTimeout(() => setReportNotice(null), 2500);
  };

  const commentMap = useMemo(
    () =>
      comments.reduce<Record<string, Comment[]>>((acc, c) => {
        acc[c.postId] = acc[c.postId] ? [...acc[c.postId], c] : [c];
        return acc;
      }, {}),
    [comments]
  );

  if (!hub) {
    return <p className="text-sm text-[var(--text-secondary)]">Carregando hub...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Hub</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{hub.name}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{hub.description}</p>
        <p className="text-xs text-[var(--text-secondary)]">Este é um espaço para compartilhar ideias, pedir feedback e iniciar discussões relevantes.</p>
      </div>

      {reportNotice && <p className="text-xs text-[var(--text-secondary)]">{reportNotice}</p>}

      <form
        onSubmit={handlePost}
        className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Publicar no feed</p>
          <p className="text-xs text-[var(--text-secondary)]">Compartilhe ideias, peça feedback ou inicie uma discussão técnica.</p>
        </div>
        <textarea
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.18)]"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex.: Quero feedback sobre arquitetura de API ou dúvidas sobre onboarding de usuários"
        />
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          {!user && <p>Faça login para postar.</p>}
          <button
            type="submit"
            disabled={!user || !content.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--action)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)] disabled:opacity-50 disabled:saturate-0"
          >
            Publicar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
            <p className="text-base font-semibold text-[var(--text-primary)]">Ainda não há publicações neste hub</p>
            <p className="mt-1">Seja a primeira pessoa a iniciar uma discussão ou pedir feedback.</p>
          </div>
        )}

        {posts.slice(0, visiblePosts).map((post) => {
          const author = resolveUser(post.authorId);
          const profileHref = `/profile/${author.username.replace('@', '')}` as unknown as Route;
          const likedPost = !!postLikes[post.id];
          const togglePostLike = () => setPostLikes((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
          return (
            <article
              key={post.id}
              className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={profileHref}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-primary)] transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                  >
                    {author.avatar}
                  </Link>
                  <div className="leading-tight">
                    <Link
                      href={profileHref}
                      className="font-semibold text-[var(--text-primary)] transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                    >
                      {author.name}
                    </Link>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Link
                        href={profileHref}
                        className="transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                      >
                        {author.username}
                      </Link>
                      <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleReportPost(post.id)}
                  className="text-[11px] text-[var(--text-secondary)] transition hover:text-[var(--action-hover)]"
                >
                  Denunciar
                </button>
              </div>

              <p className="text-sm text-[var(--text-primary)] whitespace-pre-line">{post.content}</p>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={togglePostLike}
                    whileTap={{ scale: 0.92 }}
                    animate={likedPost ? { scale: [1, 1.18, 1], rotate: [0, -10, 8, 0], boxShadow: ['0 0 0px rgba(255,82,82,0)', '0 0 20px rgba(255,82,82,0.35)', '0 0 0px rgba(255,82,82,0)'] } : { scale: 1, rotate: 0, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${likedPost ? 'border-[var(--action)] bg-[color:rgba(255,82,82,0.08)] text-[var(--action)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--action)] hover:text-[var(--action)]'}`}
                  >
                    <Heart className={`h-4 w-4 ${likedPost ? 'fill-[var(--action)] text-[var(--action)]' : ''}`} />
                    <span>{likedPost ? 'Curtido' : 'Curtir'}</span>
                  </motion.button>
                  <button
                    className="rounded-full border border-[var(--border)] px-3 py-1 transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
                    onClick={() => handleComment(post.id)}
                  >
                    Comentar
                  </button>
                </div>
                <button
                  onClick={() => handleReportPost(post.id)}
                  className="text-[11px] text-[var(--text-secondary)] transition hover:text-[var(--action-hover)]"
                >
                  Denunciar
                </button>
              </div>

              <div className="space-y-2 border-t border-[var(--border)] pt-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-surface-hover)] text-[10px] font-semibold text-[var(--text-primary)]">{(user?.displayName || 'Você').slice(0, 2).toUpperCase()}</span>
                  <input
                    value={commentDrafts[post.id] ?? ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Escreva um comentário"
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--action)]"
                      ref={(el) => {
                        commentInputs.current[post.id] = el;
                      }}
                  />
                  <button
                    type="button"
                    onClick={() => handleComment(post.id)}
                    className="rounded-lg bg-[var(--action)] px-3 py-2 text-xs font-semibold text-black transition hover:bg-[var(--action-hover)] disabled:opacity-60"
                    disabled={!commentDrafts[post.id]?.trim()}
                  >
                    Enviar
                  </button>
                </div>

                {(commentMap[post.id] ?? []).length === 0 && <p className="pl-10 text-xs text-[var(--text-secondary)]">Sem comentários.</p>}

                {(commentMap[post.id] ?? []).map((c) => {
                  const commentAuthor = resolveUser(c.authorId);
                  const commentProfileHref = `/profile/${commentAuthor.username.replace('@', '')}` as unknown as Route;
                  const liked = !!commentLikes[c.id];
                  const toggleLike = () =>
                    setCommentLikes((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
                  return (
                    <div key={c.id} className="flex gap-3 rounded-xl bg-[var(--bg-surface-hover)] p-3 text-xs text-[var(--text-primary)]">
                      <Link
                        href={commentProfileHref}
                        className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[10px] font-semibold text-[var(--text-primary)] transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                      >
                        {commentAuthor.avatar}
                      </Link>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[var(--text-secondary)]">
                          <Link
                            href={commentProfileHref}
                            className="font-semibold text-[var(--text-primary)] transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                          >
                            {commentAuthor.name}
                          </Link>
                          <Link
                            href={commentProfileHref}
                            className="transition hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
                          >
                            {commentAuthor.username}
                          </Link>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                          <span>{formatRelativeTime(c.createdAt)}</span>
                        </div>
                        <p className="text-[var(--text-primary)] whitespace-pre-line">{c.content}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                          <motion.button
                            type="button"
                            onClick={toggleLike}
                            whileTap={{ scale: 0.9 }}
                            animate={liked ? { scale: [1, 1.2, 1], rotate: [0, -12, 8, 0], boxShadow: ['0 0 0px rgba(255,82,82,0)', '0 0 24px rgba(255,82,82,0.35)', '0 0 0px rgba(255,82,82,0)'] } : { scale: 1, rotate: 0, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 transition ${liked ? 'border-[var(--action)] bg-[color:rgba(255,82,82,0.08)] text-[var(--action)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--action)] hover:text-[var(--action)]'}`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-[var(--action)] text-[var(--action)]' : ''}`} />
                            <span>{liked ? 'Curtido' : 'Curtir'}</span>
                          </motion.button>
                          {liked && <span className="text-[var(--action)]">+1</span>}
                          <button
                            onClick={() => handleReportComment(c.id)}
                            className="ml-auto text-[11px] text-[var(--text-secondary)] transition hover:text-[var(--action-hover)]"
                          >
                            Denunciar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}

        {posts.length > visiblePosts && (
          <button
            onClick={() => setVisiblePosts((prev) => Math.min(posts.length, prev + 3))}
            className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
          >
            Carregar mais
          </button>
        )}
      </div>

      <ReportModal
        open={!!reportTarget}
        targetLabel={reportTarget?.label ?? ''}
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
