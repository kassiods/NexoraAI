"use client";

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { hubService } from '@/services/hub-service';
import { useAuth } from '@/hooks/use-auth';

const schema = z.object({
  name: z.string().min(3, 'Informe um nome com pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descreva melhor o objetivo do hub'),
  category: z.string().min(2, 'Categoria obrigatória'),
  objective: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function NewHubRequestPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const categories = useMemo(() => ['Tech', 'Produto', 'Empreendedorismo', 'Mobile', 'AI/ML'], []);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setLoading(true);
    await hubService.requestHub({ ...data, requesterId: user?.uid ?? 'mock-user' });
    setSent(true);
    setLoading(false);
    reset();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Solicitar hub</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Solicitar criação de hub</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Os pedidos passam por aprovação manual para manter a qualidade da comunidade. Envie detalhes claros para agilizar a revisão.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">Nome do hub</label>
          <input
            {...register('name')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
            placeholder="Ex.: Desenvolvimento Web, Backend Brasil"
          />
          {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">Descrição</label>
          <textarea
            {...register('description')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
            rows={4}
            placeholder="Ex.: Comunidade focada em validação de ideias e MVPs, troca de feedback e encontros quinzenais."
          />
          <p className="text-xs text-[var(--text-secondary)]">Uma boa descrição acelera a aprovação e ajuda as pessoas a entenderem o hub.</p>
          {errors.description && <p className="text-xs text-red-300">{errors.description.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">Categoria</label>
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3">
            <select
              value={categoryInput || ''}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)]"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              {...register('category')}
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)]"
              placeholder="Ou sugira uma nova categoria"
            />
            <p className="text-xs text-[var(--text-secondary)]">Ajuda a organizar os hubs da comunidade.</p>
          </div>
          {errors.category && <p className="text-xs text-red-300">{errors.category.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">Objetivo (opcional)</label>
          <input
            {...register('objective')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
            placeholder="Ex.: trocar feedback, estudar juntos, construir projetos em grupo"
          />
          <p className="text-xs text-[var(--text-secondary)]">Contexto opcional para moderadores e futuros membros.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {sent && (
          <div className="rounded-lg border border-[color:rgba(16,185,129,0.25)] bg-[color:rgba(16,185,129,0.08)] px-3 py-2 text-sm text-[var(--text-primary)]">
            <p className="font-semibold">Solicitação enviada com sucesso.</p>
            <p className="text-[var(--text-secondary)]">Você será notificado quando houver atualização.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface-hover)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar solicitação'}
        </button>

        <div className="text-xs text-[var(--text-secondary)]">
          <p>Status futuro: pendente • aprovada • recusada (não exibido ainda).</p>
          <p>Histórico de solicitações ficará disponível nesta página.</p>
        </div>
      </form>
    </div>
  );
}
