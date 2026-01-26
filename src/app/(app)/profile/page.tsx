"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireProfile } from '@/hooks/use-require-profile';
import { hubService } from '@/services/hub-service';
import { userService } from '@/services/user-service';
import type { Hub } from '@/types/hub';

export default function ProfilePage() {
  const { user, loading } = useRequireProfile();
  const [userHubs, setUserHubs] = useState<Hub[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    hubService.getUserHubs(user.uid).then(setUserHubs);
  }, [user]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    const displayName = String(formData.get('displayName') ?? user.displayName ?? '');
    const bio = String(formData.get('bio') ?? user.bio ?? '');
    const area = String(formData.get('area') ?? user.area ?? '');
    await userService.updateProfile({ ...user, displayName, bio, area });
    setFeedback('Perfil salvo (mock).');
    router.refresh();
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-[#9CA3AF]">Carregando...</p>;
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Conta</p>
        <h1 className="text-2xl font-semibold text-white">Perfil</h1>
        <p className="text-sm text-[#9CA3AF]">Atualize suas informações e veja os hubs que participa.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#26262E] bg-[#16161D] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] lg:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[#E5E7EB]">Nome</label>
              <input name="displayName" defaultValue={user.displayName ?? ''} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#E5E7EB]">Área</label>
              <input name="area" defaultValue={user.area ?? ''} className="mt-1" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-[#E5E7EB]">Bio</label>
            <textarea name="bio" defaultValue={user.bio ?? ''} className="mt-1" rows={3} />
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-[#E5E7EB]">
            <span className="font-semibold">Username:</span>
            <span className="text-[#9CA3AF]">{user.username ?? 'defina no passo de perfil inicial'}</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          {feedback && <p className="mt-2 text-sm text-brand-400">{feedback}</p>}
        </form>

        <div className="rounded-xl border border-[#26262E] bg-[#16161D] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <p className="text-sm font-semibold text-white">Seus hubs</p>
          <div className="mt-3 space-y-3">
            {userHubs.length === 0 && <p className="text-sm text-[#9CA3AF]">Ainda não participa de hubs.</p>}
            {userHubs.map((hub) => (
              <div key={hub.id} className="rounded-lg border border-[#26262E] bg-[#0F1117] px-3 py-2">
                <p className="text-sm font-semibold text-white">{hub.name}</p>
                <p className="text-xs text-[#9CA3AF]">{hub.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
