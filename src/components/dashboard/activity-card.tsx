"use client";

import { motion } from 'framer-motion';
import { Flag, Heart, MessageCircle } from 'lucide-react';
import type { Post } from '@/types/post';

export type ActivityCardProps = {
  post: Post;
  authorName: string;
  hubName: string;
  createdLabel: string;
  liked: boolean;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
  onReport?: (postId: string) => void;
};

export function ActivityCard({ post, authorName, hubName, createdLabel, liked, onLike, onComment, onReport }: ActivityCardProps) {
  const initials = authorName.slice(0, 2).toUpperCase();
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-white/6 bg-[#16161D] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600/30 text-sm font-semibold text-white ring-1 ring-brand-700/50">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{authorName}</p>
            <p className="text-xs text-[#9CA3AF]">{hubName}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#16161D] px-3 py-1 text-[11px] text-[#9CA3AF]">{createdLabel}</span>
      </div>
      <p className="mt-3 text-sm text-[#E5E7EB]">{post.content}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
        <button
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            liked ? 'border-brand-500/70 bg-brand-500/15 text-brand-200 shadow-[0_0_0_1px_rgba(109,40,217,0.3)]' : 'border-[#26262E] hover:border-brand-700 hover:text-white'
          }`}
          onClick={() => onLike(post.id)}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-brand-400 text-brand-200' : ''}`} />
          Curtir
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[#26262E] px-3 py-1 transition hover:border-brand-700 hover:text-white"
          onClick={() => onComment?.(post.id)}
        >
          <MessageCircle className="h-4 w-4" />
          Comentar
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 text-[11px] text-red-200 transition hover:border-red-600/60 hover:bg-red-600/10"
          onClick={() => onReport?.(post.id)}
        >
          <Flag className="h-4 w-4" />
          Denunciar
        </button>
      </div>
    </motion.article>
  );
}
