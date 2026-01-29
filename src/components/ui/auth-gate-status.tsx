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
      <Link href="/auth/login" className="btn btn-secondary px-3 py-1 text-sm">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[var(--text-secondary)]">@{user.username ?? 'usuario'}</span>
      <button onClick={signOut} className="btn btn-secondary px-3 py-1 text-sm">
        Sair
      </button>
    </div>
  );
}
