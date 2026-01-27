"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user || user.role !== 'admin') return <p className="text-sm text-[var(--text-secondary)]">Acesso restrito.</p>;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Admin</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Painel administrativo</h1>
        <p className="text-sm text-[var(--text-secondary)]">Modere solicitações de hubs e denúncias da comunidade.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/hubs"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--bg-surface-hover)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Aprovação de hubs</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Solicitações de Hub</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Analise pedidos pendentes e aprove ou rejeite com feedback.</p>
        </Link>

        <Link
          href="/admin/reports"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--bg-surface-hover)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Denúncias</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Denúncias da comunidade</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Revise reports, resolva casos e mantenha o ambiente seguro.</p>
        </Link>
      </div>
    </div>
  );
}
