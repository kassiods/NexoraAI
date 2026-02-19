"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Hub } from '@/types/hub';

export function HubMiniCard({ hub }: { hub: Hub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition hover:-translate-y-1 hover:bg-[var(--bg-surface-hover)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">{hub.category}</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">{hub.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">{hub.members?.length ?? 0} membros</p>
        </div>
        <Link href={`/hubs/${hub.id}`} className="text-xs font-semibold text-[var(--action)] hover:text-[var(--action-hover)]">
          Ver
        </Link>
      </div>
    </motion.div>
  );
}
