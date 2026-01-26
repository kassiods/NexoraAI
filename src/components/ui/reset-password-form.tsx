"use client";

import { useState } from 'react';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Mock: apenas confirma envio sem backend
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSent(true);
    } catch (err) {
      setError('Erro ao enviar e-mail.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-800">E-mail</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {sent && <p className="text-sm text-brand-700">E-mail enviado. Verifique sua caixa de entrada.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
      >
        Enviar link
      </button>
    </form>
  );
}
