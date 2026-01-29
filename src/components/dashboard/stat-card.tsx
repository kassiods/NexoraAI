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
  purple: { bg: 'bg-[color:rgba(231,233,234,0.06)]', ring: 'ring-[color:rgba(63,65,68,0.9)]', text: 'text-[var(--text-primary)]' },
  indigo: { bg: 'bg-[color:rgba(231,233,234,0.06)]', ring: 'ring-[color:rgba(63,65,68,0.9)]', text: 'text-[var(--text-primary)]' },
  teal: { bg: 'bg-[color:rgba(231,233,234,0.06)]', ring: 'ring-[color:rgba(63,65,68,0.9)]', text: 'text-[var(--text-primary)]' }
};

export function StatCard({ label, value, hint, Icon, tone = 'purple', highlight }: StatCardProps) {
  const toneCfg = toneStyles[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneCfg.bg} text-base ${toneCfg.text} ring-1 ${toneCfg.ring}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
          {highlight && (
            <div className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] ring-1 ring-[var(--border)]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Perfil completo
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
