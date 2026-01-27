"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flag, Heart, MessageCircle } from 'lucide-react';
import type { Post } from '@/types/post';

export type ActivityCardProps = {
  post: Post;
  authorName: string;
  authorSlug?: string;
  hubName: string;
  createdLabel: string;
  liked: boolean;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
  onReport?: (postId: string) => void;
};

export function ActivityCard({ post, authorName, authorSlug, hubName, createdLabel, liked, onLike, onComment, onReport }: ActivityCardProps) {
  const initials = authorName.slice(0, 2).toUpperCase();
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--action)] text-sm font-semibold text-black ring-1 ring-[var(--border)]">
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
            <p className="text-xs text-[var(--text-secondary)]">{hubName}</p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--bg-surface-hover)] px-3 py-1 text-[11px] text-[var(--text-secondary)]">{createdLabel}</span>
      </div>
      <p className="mt-3 text-sm text-[var(--text-primary)]">{post.content}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={liked ? { scale: [1, 1.15, 1], rotate: [0, -10, 8, 0], boxShadow: ['0 0 0px rgba(255,82,82,0)', '0 0 20px rgba(255,82,82,0.35)', '0 0 0px rgba(255,82,82,0)'] } : { scale: 1, rotate: 0, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            liked
              ? 'border-[var(--action)] bg-[color:rgba(231,233,234,0.08)] text-[var(--action)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]'
          }`}
          onClick={() => onLike(post.id)}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-[var(--action)] text-[var(--action)]' : ''}`} />
          <span>{liked ? 'Curtido' : 'Curtir'}</span>
        </motion.button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
          onClick={() => onComment?.(post.id)}
        >
          <MessageCircle className="h-4 w-4" />
          Comentar
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
          onClick={() => onReport?.(post.id)}
        >
          <Flag className="h-4 w-4" />
          Denunciar
        </button>
      </div>
    </motion.article>
  );
}
