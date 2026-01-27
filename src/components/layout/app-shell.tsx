"use client";

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { Bell, Compass, Home, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type NavItem = {
  href: Route;
  label: string;
  icon: ReactNode;
};

function NavLinks({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav className="mt-6 space-y-1 text-sm font-medium text-[var(--text-primary)]">
      {items.map((item) => {
        const active = current === item.href || current.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 transition ${
              active
                ? 'bg-[var(--bg-surface)] text-[var(--action-hover)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className={`absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full transition ${active ? 'bg-[var(--action)]' : 'bg-transparent'}`} />
            <span className="text-base text-[var(--text-primary)]">{item.icon}</span>
            <span className="flex-1 pl-1">{item.label}</span>
            {active && <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">ativo</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-[var(--border)] bg-[color:rgba(10,10,10,0.9)] py-2 text-xs backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = current === item.href || current.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${active ? 'text-[var(--action-hover)] font-semibold' : 'text-[var(--text-secondary)]'}`}
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--action)] text-sm font-semibold text-black ring-1 ring-[color:rgba(255,255,255,0.08)]">
          {(user?.displayName ?? username).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">{user?.displayName ?? 'Explorador Nexora'}</p>
          <p className="text-xs text-[var(--text-secondary)]">@{username}</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4 text-white" /> },
      { href: '/hubs', label: 'Hubs', icon: <Compass className="h-4 w-4 text-white" /> },
      { href: '/notifications', label: 'Notificações', icon: <Bell className="h-4 w-4 text-white" /> },
      { href: '/profile', label: 'Perfil', icon: <UserRound className="h-4 w-4 text-white" /> }
    ];
    if (user?.role === 'admin') {
      base.splice(3, 0, { href: '/admin', label: 'Admin', icon: <UserRound className="h-4 w-4 text-white" /> });
    }
    return base;
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-[var(--border)] bg-[color:rgba(22,24,28,0.95)] px-4 py-6 backdrop-blur transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex items-center justify-between px-2">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--action)] text-black">
                N
              </span>
              <span>Nexora</span>
            </Link>
            <button className="lg:hidden text-[var(--text-secondary)]" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks items={navItems} current={pathname} />
          <div className="mt-auto space-y-3 px-2 text-sm text-[var(--text-secondary)]">
            {user ? (
              <SidebarFooter user={user} />
            ) : (
              <Link href="/auth/login" className="text-[var(--action)] underline">
                Entrar
              </Link>
            )}
            {user && (
              <button
                onClick={signOut}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
              >
                Sair
              </button>
            )}
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[color:rgba(10,10,10,0.9)] px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)]" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/dashboard" className="text-base font-semibold text-[var(--text-primary)]">
                Nexora
              </Link>
            </div>
            <Link href="/profile" className="text-sm text-[var(--text-secondary)]">
              {user?.displayName ?? 'Perfil'}
            </Link>
          </header>

          <main className="flex-1 bg-[var(--bg-base)] px-4 pb-24 pt-4 lg:px-8 lg:pb-12">
            {children}
          </main>

          <MobileNav items={navItems} current={pathname} />
        </div>
      </div>
    </div>
  );
}
