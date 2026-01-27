import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-center rounded-xl bg-[var(--bg-surface)] px-8 py-10 lg:flex">
            <div className="mb-8 flex items-center gap-3 text-xl font-semibold text-[var(--text-primary)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--action)] text-lg font-bold text-black">
                N
              </div>
              <span>Nexora</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[var(--text-primary)]">Conecte, valide e evolua suas ideias.</h1>
            <p className="mt-4 text-base text-[var(--text-secondary)]">
              Comunidade focada em hubs de conhecimento, feedback rápido e networking qualificado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--text-primary)]">
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1">Hubs temáticos</span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1">Feedbacks</span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1">Mentorias</span>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-lg flex-col justify-center">
            <Link href="/" className="mb-6 inline-flex items-center gap-3 text-lg font-semibold text-[var(--text-primary)] lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--action)] text-lg font-bold text-black">N</div>
              Nexora
            </Link>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-8 sm:px-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
