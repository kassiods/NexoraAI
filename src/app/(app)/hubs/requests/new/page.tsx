"use client";

import { useState } from 'react';
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
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setLoading(true);
    await hubService.requestHub({ ...data, requesterId: user?.uid ?? 'mock-user' });
    setSent(true);
    setLoading(false);
    reset();
  };

  return (
    <div className="max-w-xl space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Solicitar hub</p>
        <h1 className="text-2xl font-semibold text-white">Solicitar criação de hub</h1>
        <p className="text-sm text-[#9CA3AF]">
          Envie nome, descrição e categoria. A solicitação ficará pendente até aprovação para evitar spam e manter
          organização.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 via-[#131322] to-[#0B0B12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <div>
          <label className="text-sm font-medium text-[#E5E7EB]">Nome</label>
          <input {...register('name')} className="mt-1" />
          {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-[#E5E7EB]">Descrição</label>
          <textarea {...register('description')} className="mt-1" rows={3} />
          {errors.description && <p className="text-xs text-red-300">{errors.description.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-[#E5E7EB]">Categoria</label>
          <input {...register('category')} className="mt-1" />
          {errors.category && <p className="text-xs text-red-300">{errors.category.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-[#E5E7EB]">Objetivo (opcional)</label>
          <input {...register('objective')} className="mt-1" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {sent && <p className="text-sm text-brand-400">Solicitação enviada (mock).</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white shadow-[0_10px_30px_rgba(109,40,217,0.35)] transition hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </div>
  );
}
