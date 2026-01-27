"use client";

import Link from 'next/link';
import { mockUsers } from '@/data/mock/users';
import { mockHubs } from '@/data/mock/hubs';

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const userEntry = Object.values(mockUsers).find((u) => (u.username ?? '').replace('@', '') === params.username);

  if (!userEntry) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Perfil</h1>
        <p className="text-sm text-[var(--text-secondary)]">Usuário não encontrado.</p>
        <Link href="/hubs" className="text-sm text-[var(--action)] hover:text-[var(--action-hover)]">
          Voltar para hubs
        </Link>
      </div>
    );
  }

  const avatar = (userEntry.displayName || userEntry.email || params.username).slice(0, 2).toUpperCase();
  const areas = userEntry.areas ?? (userEntry.area ? [userEntry.area] : []);
  const userHubs = mockHubs.filter((h) => userEntry.hubs?.includes(h.id));
  const profileIsComplete = Boolean(userEntry.displayName && userEntry.username);
  const socialSubtext = userHubs.length > 0 ? `Contribuidor em ${userHubs.length} hubs` : 'Ativo na comunidade';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)] text-lg font-semibold text-[var(--text-primary)] ring-1 ring-[var(--border)]">
          {avatar}
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{userEntry.displayName}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{userEntry.username}</p>
          <p className="text-xs text-[var(--text-secondary)]">{socialSubtext}</p>
          <p className="text-xs text-[var(--text-secondary)]">{profileIsComplete ? 'Perfil completo' : 'Perfil em atualização'}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Bio</p>
        <p className="text-sm text-[var(--text-secondary)]">{userEntry.bio || 'Sem bio informada.'}</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Áreas de atuação</p>
        {areas.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">Nenhuma área adicionada.</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-sm text-[var(--text-primary)]">
            {areas.map((area) => (
              <span key={area} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1 text-xs text-[var(--text-primary)] ring-1 ring-[color:rgba(255,255,255,0.04)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" aria-hidden />
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center justify-between text-sm text-[var(--text-primary)]">
          <p className="font-semibold">Hubs</p>
          <Link href="/hubs" className="text-xs text-[var(--action)] hover:text-[var(--action-hover)]">
            Explorar hubs
          </Link>
        </div>
        {userHubs.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">Este usuário ainda está explorando a comunidade.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {userHubs.map((hub) => (
              <Link
                key={hub.id}
                href={`/hubs/${hub.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-2 transition hover:border-[var(--action)] hover:text-[var(--action-hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--action)]"
              >
                <p className="font-semibold text-[var(--text-primary)]">{hub.name}</p>
                <p className="text-[var(--text-secondary)]">{hub.category}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Future gamification slot (kept invisible for now) */}
      <div className="hidden" aria-hidden data-future="profile-gamification-slot" />
    </div>
  );
}
