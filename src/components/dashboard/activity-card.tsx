"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flag, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { Post } from '@/types/post';

export type ActivityCardProps = {
  post: Post;
  authorName: string;
  authorSlug?: string;
  hubName: string;
  hubId: string;
  createdLabel: string;
  liked: boolean;
  likeCount?: number;
  commentCount?: number;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
  onReport?: (postId: string) => void;
};

export function ActivityCard({ post, authorName, authorSlug, hubName, hubId, createdLabel, liked, likeCount, commentCount, onLike, onComment, onReport }: ActivityCardProps) {
  const initials = authorName.slice(0, 2).toUpperCase();
  const [showComment, setShowComment] = useState(false);
  const [draft, setDraft] = useState('');

  const toggleComment = () => {
    setShowComment((prev) => !prev);
    onComment?.(post.id);
  };
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--action)] text-base font-semibold text-black ring-1 ring-[var(--border)]">
            {initials}
          </div>
          <div>
            {authorSlug ? (
              <Link href={`/profile/${authorSlug}`} className="text-sm font-semibold leading-tight text-[var(--text-primary)] hover:text-[var(--action-hover)]">
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">{authorName}</p>
            )}
            <Link
              href={{ pathname: '/hubs/[id]', query: { id: hubId } }}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--bg-surface-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:text-[var(--action)]"
            >
              {hubName}
            </Link>
          </div>
        </div>
        <span className="rounded-full bg-[var(--bg-surface-hover)] px-3 py-1 text-[11px] text-[var(--text-secondary)]">{createdLabel}</span>
      </div>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-primary)]">{post.content}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={liked ? { scale: [1, 1.12, 1], rotate: [0, -10, 8, 0], boxShadow: ['0 0 0px rgba(255,82,82,0)', '0 0 18px rgba(255,82,82,0.35)', '0 0 0px rgba(255,82,82,0)'] } : { scale: 1, rotate: 0, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
            liked
              ? 'border-[var(--action)] bg-[color:rgba(231,233,234,0.08)] text-[var(--action)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]'
          }`}
          onClick={() => onLike(post.id)}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-[var(--action)] text-[var(--action)]' : ''}`} />
          <span>{liked ? 'Curtido' : 'Curtir'}</span>
          {typeof likeCount === 'number' && <span className="text-[11px] text-[var(--text-secondary)]">{likeCount}</span>}
        </motion.button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
          onClick={toggleComment}
        >
          <MessageCircle className="h-4 w-4" />
          Comentar
          {typeof commentCount === 'number' && <span className="text-[11px] text-[var(--text-secondary)]">{commentCount}</span>}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
          onClick={() => onReport?.(post.id)}
        >
          <Flag className="h-4 w-4" />
          Denunciar
        </button>
      </div>
      {showComment && (
        <div className="mt-4 space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-hover)] p-4">
          <label className="text-xs font-semibold text-[var(--text-secondary)]" htmlFor={`comment-${post.id}`}>
            Escreva um comentário rápido (em breve será publicado)
          </label>
          <textarea
            id={`comment-${post.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Curti! Conta mais detalhes ou compartilha o repositório."
            className="min-h-[90px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--action)]"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>Envio real chega em breve.</span>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-full bg-[var(--action)] px-4 py-2 text-xs font-semibold text-black opacity-80"
            >
              Publicar em breve
            </button>
          </div>
        </div>
      )}
    </motion.article>
  );
}
