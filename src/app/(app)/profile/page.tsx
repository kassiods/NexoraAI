"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireProfile } from '@/hooks/use-require-profile';
import { hubService } from '@/services/hub-service';
import { userService } from '@/services/user-service';
import type { Hub } from '@/types/hub';
import { getSupabaseClient } from '@/lib/supabase-client';

function LaptopIcon() {
  return (
    <svg
      className="h-4 w-4 text-brand-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M4 16h16" />
      <path d="M2 18h20" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      className="h-4 w-4 text-brand-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 7.5V6a2 2 0 0 1 2-2h1.5a2 2 0 0 1 1.414.586l10.5 10.5a2 2 0 0 1 0 2.828l-3 3a2 2 0 0 1-2.828 0L1 10.828A2 2 0 0 1 .414 9.414L1 8.5z" />
      <circle cx="7" cy="7" r="1.25" />
    </svg>
  );
}

function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 2.5 13.8 8l5.7 1.8-5.7 1.9-1.8 5.7-1.9-5.7L4 9.8 9.9 8z" />
      <path d="M5 4.5 5.6 6 7 6.5 5.6 7 5 8.5 4.4 7 3 6.5 4.4 6z" />
      <path d="M18.5 16 19 17.2 20.2 17.7 19 18.2 18.5 19.4 18 18.2 16.8 17.7 18 17.2z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, loading } = useRequireProfile();
  const [userHubs, setUserHubs] = useState<Hub[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profileIsComplete = Boolean(user?.displayName && user?.username);
  const bioPlaceholder = useMemo(() => {
    const options = [
      'No que você está trabalhando agora?',
      'Que tipo de feedback você procura?',
      'Como as pessoas podem te ajudar?',
      'Qual problema você quer resolver a seguir?'
    ];
    return options[(user?.displayName?.length ?? 0) % options.length];
  }, [user?.displayName]);
  const initials = useMemo(() => {
    const source = displayName || user?.displayName || user?.email || user?.username || '?';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [displayName, user?.displayName, user?.email, user?.username]);

  useEffect(() => {
    if (!user) return;
    hubService.getUserHubs(user.uid).then(setUserHubs);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? '');
    setBio(user.bio ?? '');
    setPhotoPreview(user.photoURL ?? null);
    const normalizedAreas = (user.areas && user.areas.length > 0
      ? user.areas
      : user.area
      ? [user.area]
      : []
    ).slice(0, 3);
    setAreas(normalizedAreas);
    setAreaInput('');
  }, [user]);

  const originalAreas = useMemo(() => {
    if (!user) return [] as string[];
    if (user.areas && user.areas.length > 0) return user.areas.slice(0, 3);
    if (user.area) return [user.area];
    return [] as string[];
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    const displayChanged = displayName.trim() !== (user.displayName ?? '').trim();
    const bioChanged = bio.trim() !== (user.bio ?? '').trim();
    const areasChanged = JSON.stringify(areas) !== JSON.stringify(originalAreas);
    const photoChanged = (photoPreview || '') !== (user.photoURL || '');
    return displayChanged || bioChanged || areasChanged || photoChanged;
  }, [areas, bio, displayName, originalAreas, photoPreview, user]);

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setFeedback(`Imagem muito grande (>${maxSizeMb}MB).`);
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const addArea = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    if (areas.length >= 3) return;
    if (areas.some((a) => a.toLowerCase() === cleaned.toLowerCase())) return;
    setAreas([...areas, cleaned]);
    setAreaInput('');
  };

  const removeArea = (value: string) => {
    setAreas(areas.filter((a) => a !== value));
  };

  const goToHubs = () => {
    router.push('/hubs');
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!hasChanges) return;
    setSaving(true);
    setFeedback(null);
    let uploadedUrl: string | null = null;
    try {
      if (photoFile) {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase não configurado');
        const ext = (photoFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${user.uid}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, photoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: photoFile.type || 'image/jpeg'
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        uploadedUrl = data.publicUrl;
      }

      const updated = await userService.updateProfile({
        ...user,
        displayName: displayName.trim(),
        bio: bio.trim(),
        area: areas[0] ?? '',
        areas,
        photoURL: uploadedUrl ?? photoPreview ?? null
      });
      setFeedback('Perfil salvo.');
      // Re-hidrata campos locais com o que veio do backend (evita sensação de não salvar)
      setDisplayName(updated.displayName ?? '');
      setBio(updated.bio ?? '');
      setPhotoPreview(updated.photoURL ?? uploadedUrl ?? photoPreview ?? null);
      setPhotoFile(null);
    } catch (err: any) {
      console.error('Erro ao salvar perfil', err);
      const msg = err?.message || err?.error_description || 'Erro ao salvar perfil. Tente novamente.';
      setFeedback(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Conta</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Perfil</h1>
        <p className="text-sm text-[var(--text-secondary)]">Refine sua identidade e como a comunidade percebe você.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_1.6fr]">
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="relative flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface-hover)] text-2xl font-bold uppercase text-[var(--text-primary)] ring-2 ring-[color:rgba(47,51,54,0.6)]">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={user.displayName ?? 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || 'N'
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Identidade</p>
                <h2 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">{displayName || 'Nome não definido'}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-primary)]">
                  <span className="rounded-full bg-[var(--bg-surface-hover)] px-3 py-1 font-semibold text-[var(--text-primary)] ring-1 ring-[var(--border)]">
                    {user.username || '@username'}</span>
                  <span className="text-[var(--text-secondary)]">Username público • não pode ser alterado</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
                  >
                    Alterar foto
                  </button>
                  <span className="text-[var(--text-secondary)]">PNG/JPG, até 5MB</span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
            />

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface-hover)] px-3 py-1 text-[var(--text-primary)]">
                <LaptopIcon />
                <span>{areas[0] ? areas[0] : 'Defina sua área de atuação'}</span>
              </span>
              {areas.slice(1).map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
                  <LaptopIcon />
                  <span>{item}</span>
                </span>
              ))}
              {profileIsComplete ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-primary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--action)]" />
                  Perfil completo
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-primary)]" title="Preencha nome, username e bio para completar seu perfil">
                  <span className="h-2 w-2 rounded-full bg-[var(--text-secondary)]" />
                  Perfil incompleto
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {profileIsComplete ? 'Seu perfil está pronto para participar e colaborar em hubs.' : 'Complete seu perfil para participar de hubs.'}
            </p>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)]">
              <p className="font-semibold text-[var(--text-primary)]">Bio</p>
              <p className="mt-1 text-[var(--text-secondary)]">{bio || 'No que você está trabalhando agora? Que tipo de feedback você busca?'}</p>
            </div>

            <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)]">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Áreas de atuação</p>
              {areas.length === 0 ? (
                <p className="mt-2 text-[var(--text-secondary)]">Adicione até 3 áreas para mostrar como você contribui.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {areas.map((item, index) => (
                    <span
                      key={item}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                        index === 0
                          ? 'border border-[var(--border)] bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'
                          : 'border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <LaptopIcon />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Essas áreas ajudam a comunidade a entender como você pode contribuir.</p>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#26262E] bg-[#0F0F16] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Edição</p>
              <h3 className="text-xl font-semibold text-white">Atualize sua presença</h3>
              <p className="text-sm text-[#A4A5B1]">Campos com foco suave, salvamento com feedback imediato.</p>
            </div>
            {feedback && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#13281F] px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-500/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Salvo
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#D5D6E2]">Nome</label>
              <input
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-[#242534] bg-[#0D0D14] px-3 py-3 text-sm text-white outline-none transition duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                placeholder="Seu nome como será exibido"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#D5D6E2]">Bio</label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[#242534] bg-[#0D0D14] px-3 py-3 text-sm text-white outline-none transition duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                placeholder={bioPlaceholder}
              />
              <p className="text-xs text-[var(--text-secondary)]">No que você está trabalhando agora? Que tipo de feedback você busca?</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#D5D6E2]">Áreas de atuação</label>
              <div className="rounded-xl border border-[#242534] bg-[#0D0D14] px-3 py-2">
                <div className="flex flex-wrap gap-2 pb-2">
                  {areas.map((item, index) => (
                    <span
                      key={item}
                      className={`group inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition ${
                        index === 0
                          ? 'border border-[var(--border)] bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'
                          : 'border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <LaptopIcon />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeArea(item)}
                        className="text-[var(--text-secondary)] transition hover:text-[var(--action-hover)]"
                        aria-label={`Remover ${item}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  name="areaInput"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArea(areaInput);
                    }
                  }}
                  className="w-full bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-[#6B6C7C]"
                  placeholder="Ex.: Backend, APIs, Node.js"
                />
                <div className="flex items-center justify-between text-xs text-[#7D7E8F]">
                  <span>{areas.length} de 3 áreas adicionadas</span>
                  <span>Pressione Enter para adicionar</span>
                </div>
              </div>
              <p className="text-xs text-[#7D7E8F]">Essas áreas serão exibidas como tags públicas.</p>
            </div>

            <div className="space-y-1 rounded-xl border border-[#1B1C2B] bg-[#0A0B12] px-4 py-3 text-sm text-[#C8C9D8]">
              <p className="text-xs uppercase tracking-[0.12em] text-[#7D7E8F]">Identidade</p>
              <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
                <span className="rounded-md bg-[#151624] px-3 py-1">{user.username}</span>
                <span className="text-[#8C8DA0]">Username público • não pode ser alterado</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--text-secondary)]" />
              <span>Microinterações: foco suave e transições de 180ms.</span>
            </div>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-black transition duration-200 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                  Salvando...
                </>
              ) : feedback ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Salvar alterações
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Em breve</p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Contribuições recentes (em breve)</h3>
        <p className="mt-2 text-[var(--text-secondary)]">Acompanhe suas publicações e feedbacks assim que lançarmos.</p>
      </section>

      <section className="rounded-2xl border border-[#26262E] bg-[#0F0F16] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Hubs</p>
            <h3 className="text-xl font-semibold text-white">Seus hubs</h3>
          </div>
          <button
            type="button"
            onClick={goToHubs}
            className="rounded-lg border border-brand-500/30 px-3 py-2 text-xs font-semibold text-brand-100 transition hover:border-brand-400 hover:bg-brand-500/10"
          >
            Explorar hubs
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {userHubs.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex h-full items-center justify-between rounded-xl border border-dashed border-[#303144] bg-[#0C0D15] px-5 py-6 text-sm text-[#B6B7C6]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1A2A] text-lg text-brand-200">
                    <SparkIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Você ainda não participa de hubs.</p>
                    <p className="text-[#8C8DA0]">Encontre um hub para começar, aprender com moderadores e acompanhar discussões em grupo.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={goToHubs}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#E6E6E6]"
                >
                  Explorar hubs
                </button>
              </div>
            </div>
          )}
          {userHubs.map((hub) => (
            <div
              key={hub.id}
              className="rounded-xl border border-[#26262E] bg-[#0B0C13] p-4 transition duration-200 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
            >
              <p className="text-sm font-semibold text-white">{hub.name}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#1F1A2A] px-3 py-1 text-xs text-brand-100 ring-1 ring-brand-500/30">
                <TagIcon />
                <span>{hub.category}</span>
              </div>
              <button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-100 transition hover:text-white">
                Ver hub
                <span aria-hidden className="text-brand-200">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
