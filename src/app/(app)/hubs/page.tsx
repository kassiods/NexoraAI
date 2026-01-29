"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Hub } from '@/types/hub';
import { hubService } from '@/services/hub-service';

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    hubService.listHubs().then(setHubs);
    hubService.listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [term]);

  const filtered = hubs.filter((h) => {
    const matchesCategory = category ? h.category === category : true;
    const matchesTerm = debounced
      ? h.name.toLowerCase().includes(debounced) || h.description.toLowerCase().includes(debounced) || (h.context ?? '').toLowerCase().includes(debounced)
      : true;
    return matchesCategory && matchesTerm;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Explorar</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Hubs</h1>
          <p className="text-sm text-[var(--text-secondary)]">Explore hubs por categoria e solicite entrada.</p>
          <p className="text-xs text-[var(--text-secondary)]">Aqui estão os espaços onde pessoas trocam feedback, constroem projetos e evoluem juntas.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar hubs ou descrições"
              className="w-48 border-none bg-transparent p-0 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-0"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field max-w-[220px]">
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link
            href="/hubs/requests/new"
            className="btn btn-primary px-4 py-2 text-sm hover:scale-[1.01]"
          >
            Solicitar novo hub
          </Link>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">Hubs são comunidades onde você troca feedback, acompanha projetos e cresce junto com outras pessoas.</p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((hub) => {
          const statusLabel = hub.status === 'request' ? 'Entrada por solicitação' : 'Aberto';
          const ctaLabel = hub.status === 'request' ? 'Solicitar participação' : 'Explorar hub';
          return (
            <div
              key={hub.id}
              className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-[var(--bg-surface-hover)]"
            >
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <p className="font-semibold uppercase tracking-wide">{hub.category}</p>
                <span className="text-[var(--text-secondary)]">{statusLabel}</span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{hub.name}</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{hub.description}</p>
              {hub.context && <p className="mt-2 text-sm text-[var(--text-primary)]">{hub.context}</p>}
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-primary)]">
                <Link
                  href={`/hubs/${hub.id}`}
                  className="btn btn-secondary px-3 py-2 text-xs"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-sm text-[var(--text-primary)]">
            <p className="text-base font-semibold text-[var(--text-primary)]">Nenhum hub encontrado</p>
            <p className="mt-1 text-[var(--text-secondary)]">Você pode ajustar os filtros ou solicitar a criação de um novo hub.</p>
            <Link
              href="/hubs/requests/new"
              className="btn btn-primary mt-3 inline-flex px-4 py-2 text-xs"
            >
              Solicitar novo hub
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-1 text-xs text-[var(--text-secondary)]">
        <p>Sua participação em hubs influencia sua visibilidade na comunidade.</p>
      </div>
    </div>
  );
}
