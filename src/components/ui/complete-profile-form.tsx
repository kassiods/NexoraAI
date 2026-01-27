"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';

const normalizeUsername = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

export function CompleteProfileForm({ user }: { user: UserProfile | null }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await userService.updateProfile({
        ...user,
        username: `@${normalizeUsername(username)}`,
        displayName,
        area
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao salvar perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Username (fixo)</label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[var(--text-secondary)]">
            @
          </span>
          <input
            type="text"
            className="w-full rounded-r-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[var(--text-primary)]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Nome público</label>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[var(--text-primary)]"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Área de atuação</label>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[var(--text-primary)]"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--action)] px-4 py-2 font-semibold text-black transition hover:bg-[var(--action-hover)] disabled:opacity-70"
      >
        {loading ? 'Salvando...' : 'Salvar e continuar'}
      </button>
    </form>
  );
}
