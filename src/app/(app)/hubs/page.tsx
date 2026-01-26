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
    const matchesTerm = debounced ? h.name.toLowerCase().includes(debounced) || h.description.toLowerCase().includes(debounced) : true;
    return matchesCategory && matchesTerm;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Explorar</p>
          <h1 className="text-2xl font-semibold text-white">Hubs</h1>
          <p className="text-sm text-[#9CA3AF]">Explore hubs por categoria e solicite entrada.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#26262E] bg-[#0F1117] px-3 py-2 text-sm text-[#E5E7EB]">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar hubs ou descrições"
              className="w-48 border-none bg-transparent p-0 text-sm text-white placeholder:text-[#6B7280] focus:ring-0"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-sm">
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link
            href="/hubs/requests/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(109,40,217,0.35)] transition hover:bg-brand-500 hover:scale-[1.01]"
          >
            Solicitar novo hub
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((hub) => (
          <Link
            key={hub.id}
            href={`/hubs/${hub.id}`}
            className="rounded-xl border border-white/6 bg-[#16161D] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:scale-[1.01] hover:border-brand-700 hover:bg-[#1C1C25]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">{hub.category}</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{hub.name}</h2>
            <p className="mt-2 text-sm text-[#9CA3AF]">{hub.description}</p>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[#9CA3AF]">Nenhum hub encontrado para essa busca.</p>}
      </div>
    </div>
  );
}
