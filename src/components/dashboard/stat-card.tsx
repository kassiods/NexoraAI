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
  purple: { bg: 'bg-brand-600/20', ring: 'ring-brand-700/50', text: 'text-brand-300' },
  indigo: { bg: 'bg-indigo-600/20', ring: 'ring-indigo-700/50', text: 'text-indigo-200' },
  teal: { bg: 'bg-teal-600/20', ring: 'ring-teal-700/50', text: 'text-teal-200' }
};

export function StatCard({ label, value, hint, Icon, tone = 'purple', highlight }: StatCardProps) {
  const toneCfg = toneStyles[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-white/6 bg-[#16161D] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.38)]"
    >
      <div className="absolute -left-16 -top-14 h-32 w-32 rounded-full bg-brand-700/10 blur-3xl" aria-hidden />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-4xl font-semibold leading-tight text-white">{value}</p>
          <p className="text-sm font-medium text-[#C7CBD4]">{label}</p>
          <p className="text-xs text-[#9CA3AF]">{hint}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneCfg.bg} text-lg ${toneCfg.text} ring-1 ${toneCfg.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {highlight && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-inner shadow-emerald-900/40">
          <CheckCircle2 className="h-4 w-4" /> Perfil completo
        </div>
      )}
    </motion.div>
  );
}
