"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function AuthGateStatus() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="text-slate-500">Carregando...</span>;
  }

  if (!user) {
    return (
      <Link href="/auth/login" className="rounded-md border border-slate-200 px-3 py-1 text-slate-800">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-700">@{user.username ?? 'usuario'}</span>
      <button
        onClick={signOut}
        className="rounded-md border border-slate-200 px-3 py-1 text-slate-700 hover:border-brand-200 hover:text-brand-700"
      >
        Sair
      </button>
    </div>
  );
}
