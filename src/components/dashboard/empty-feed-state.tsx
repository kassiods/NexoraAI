"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import type { Hub } from '@/types/hub';

type Props = {
  recommended?: Hub[];
};

export function EmptyFeedState({ recommended = [] }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-white/10 bg-[#111118] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600/20 to-indigo-500/20 text-brand-200 ring-1 ring-brand-500/40">
        <Compass className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">Feed vazio por enquanto</h3>
      <p className="mt-2 text-sm text-[#9CA3AF]">
        Explore hubs ativos para ver publicações, trocar feedback e acompanhar novidades.
      </p>
      <Link
        href="/hubs"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(109,40,217,0.35)] transition hover:bg-brand-500"
      >
        Explorar Hubs
      </Link>
      {recommended.length > 0 && (
        <div className="mt-6 space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Sugestões</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {recommended.slice(0, 3).map((hub) => (
              <Link
                key={hub.id}
                href={`/hubs/${hub.id}`}
                className="group rounded-xl border border-white/8 bg-[#16161D] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-[0_14px_38px_rgba(0,0,0,0.35)]"
              >
                <p className="text-sm font-semibold text-white">{hub.name}</p>
                <p className="text-xs text-[#9CA3AF]">{hub.category}</p>
                <span className="mt-2 inline-flex text-xs font-semibold text-brand-300 opacity-0 transition group-hover:opacity-100">
                  Ver hub →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
