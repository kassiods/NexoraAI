"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Hub } from '@/types/hub';

export function HubMiniCard({ hub }: { hub: Hub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/5 bg-[#0F1117] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition hover:border-brand-600/60 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-300">{hub.category}</p>
          <p className="text-base font-semibold text-white">{hub.name}</p>
          <p className="text-xs text-[#9CA3AF]">{hub.members.length} membros</p>
        </div>
        <Link href={`/hubs/${hub.id}`} className="text-xs font-semibold text-brand-400 hover:text-brand-200">
          Ver
        </Link>
      </div>
    </motion.div>
  );
}
