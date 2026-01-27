"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function AuthGateStatus() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="text-[var(--text-secondary)]">Carregando...</span>;
  }

  if (!user) {
    return (
      <Link href="/auth/login" className="rounded-md border border-[var(--border)] px-3 py-1 text-[var(--text-primary)]">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[var(--text-secondary)]">@{user.username ?? 'usuario'}</span>
      <button
        onClick={signOut}
        className="rounded-md border border-[var(--border)] px-3 py-1 text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
      >
        Sair
      </button>
    </div>
  );
}
