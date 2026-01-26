import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#0F1117] to-[#0B0B0F] text-[#E5E7EB]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 rounded-2xl border border-[#26262E] bg-[#12121A]/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-center rounded-xl bg-gradient-to-br from-[#16161D] to-[#0F1117] px-8 py-10 lg:flex">
            <div className="mb-8 flex items-center gap-3 text-xl font-semibold text-[#E5E7EB]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6D28D9] text-lg font-bold text-white shadow-lg shadow-[#6D28D9]/40">
                N
              </div>
              <span>Nexora</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#E5E7EB]">Conecte, valide e evolua suas ideias.</h1>
            <p className="mt-4 text-base text-[#9CA3AF]">
              Comunidade focada em hubs de conhecimento, feedback rápido e networking qualificado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#E5E7EB]">
              <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Hubs temáticos</span>
              <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Feedbacks</span>
              <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Mentorias</span>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-lg flex-col justify-center">
            <Link href="/" className="mb-6 inline-flex items-center gap-3 text-lg font-semibold text-[#E5E7EB] lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6D28D9] text-lg font-bold text-white shadow-lg shadow-[#6D28D9]/40">N</div>
              Nexora
            </Link>
            <div className="rounded-xl border border-[#26262E] bg-[#16161D] px-6 py-8 shadow-[0_10px_50px_rgba(0,0,0,0.35)] sm:px-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
