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
      className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-surface-hover)] text-[var(--action)] ring-1 ring-[var(--border)]">
        <Compass className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">Feed vazio por enquanto</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Explore hubs ativos para ver publicações, trocar feedback e acompanhar novidades.
      </p>
      <Link
        href="/hubs"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--action)] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)]"
      >
        Explorar Hubs
      </Link>
      {recommended.length > 0 && (
        <div className="mt-6 space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Sugestões</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {recommended.slice(0, 3).map((hub) => (
              <Link
                key={hub.id}
                href={`/hubs/${hub.id}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-[var(--bg-surface-hover)]"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{hub.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{hub.category}</p>
                <span className="mt-2 inline-flex text-xs font-semibold text-[var(--text-primary)] opacity-0 transition group-hover:opacity-100">
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
