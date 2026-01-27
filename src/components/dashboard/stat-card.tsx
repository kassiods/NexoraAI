"use client";

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

export type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
  Icon: LucideIcon;
  tone?: 'purple' | 'indigo' | 'teal';
  highlight?: boolean;
};

const toneStyles: Record<NonNullable<StatCardProps['tone']>, { bg: string; ring: string; text: string }> = {
  purple: { bg: 'bg-[color:rgba(255,255,255,0.04)]', ring: 'ring-[color:rgba(47,51,54,0.9)]', text: 'text-[var(--text-primary)]' },
  indigo: { bg: 'bg-[color:rgba(255,255,255,0.04)]', ring: 'ring-[color:rgba(47,51,54,0.9)]', text: 'text-[var(--text-primary)]' },
  teal: { bg: 'bg-[color:rgba(255,255,255,0.04)]', ring: 'ring-[color:rgba(47,51,54,0.9)]', text: 'text-[var(--text-primary)]' }
};

export function StatCard({ label, value, hint, Icon, tone = 'purple', highlight }: StatCardProps) {
  const toneCfg = toneStyles[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-4xl font-semibold leading-tight text-[var(--action-hover)]">{value}</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneCfg.bg} text-lg ${toneCfg.text} ring-1 ${toneCfg.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {highlight && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
          <CheckCircle2 className="h-4 w-4" /> Perfil completo
        </div>
      )}
    </motion.div>
  );
}
