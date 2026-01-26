"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { Bell, Compass, Home, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { href: '/hubs', label: 'Hubs', icon: <Compass className="h-4 w-4" /> },
  { href: '/notifications', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
  { href: '/profile', label: 'Perfil', icon: <UserRound className="h-4 w-4" /> }
];

function NavLinks({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav className="mt-6 space-y-1 text-sm font-medium text-[#E5E7EB]">
      {items.map((item) => {
        const active = current === item.href || current.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 transition ${
              active
                ? 'bg-[#16161D] text-white shadow-[0_10px_50px_rgba(109,40,217,0.25)]'
                : 'text-[#9CA3AF] hover:bg-[#1C1C25] hover:text-white hover:shadow-[0_10px_30px_rgba(109,40,217,0.12)]'
            }`}
          >
            <span className={`absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full transition ${active ? 'bg-brand-500 shadow-[0_0_14px_rgba(109,40,217,0.85)]' : 'bg-transparent'}`} />
            <span className="text-base text-[#E5E7EB]">{item.icon}</span>
            <span className="flex-1 pl-1">{item.label}</span>
            {active && <span className="text-[10px] uppercase tracking-[0.2em] text-brand-300">ativo</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-[#26262E] bg-[#0F1117]/90 py-2 text-xs shadow-lg backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = current === item.href || current.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${active ? 'text-brand-400 font-semibold' : 'text-[#9CA3AF]'}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  const username = useMemo(() => user?.username ?? user?.email ?? 'convidado', [user]);
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/5 via-[#11111A]/80 to-[#0B0B12] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 opacity-40 blur-3xl" aria-hidden />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/25 text-sm font-semibold text-white ring-1 ring-brand-500/50">
          {(user?.displayName ?? username).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-tight">{user?.displayName ?? 'Explorador Nexora'}</p>
          <p className="text-xs text-brand-200">@{username}</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#E5E7EB]">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-[#26262E] bg-[#0F1117]/95 px-4 py-6 backdrop-blur transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex items-center justify-between px-2">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-900/50">
                N
              </span>
              <span>Nexora</span>
            </Link>
            <button className="lg:hidden text-[#9CA3AF]" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks items={navItems} current={pathname} />
          <div className="mt-auto space-y-3 px-2 text-sm text-[#9CA3AF]">
            {user ? (
              <SidebarFooter user={user} />
            ) : (
              <Link href="/auth/login" className="text-brand-400 underline">
                Entrar
              </Link>
            )}
            {user && (
              <button
                onClick={signOut}
                className="w-full rounded-lg border border-[#26262E] px-3 py-2 text-left text-[#E5E7EB] transition hover:border-brand-700 hover:text-white"
              >
                Sair
              </button>
            )}
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#26262E] bg-[#0F1117]/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-[#26262E] bg-[#0B0B10] p-2 text-white" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/dashboard" className="text-base font-semibold text-white">
                Nexora
              </Link>
            </div>
            <Link href="/profile" className="text-sm text-[#9CA3AF]">
              {user?.displayName ?? 'Perfil'}
            </Link>
          </header>

          <main className="flex-1 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B12] to-[#0B0B0F] px-4 pb-24 pt-4 lg:px-8 lg:pb-12">
            {children}
          </main>

          <MobileNav items={navItems} current={pathname} />
        </div>
      </div>
    </div>
  );
}
