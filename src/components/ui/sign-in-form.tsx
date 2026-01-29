"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userService } from '@/services/user-service';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await userService.signIn(email, password);
      const redirect = searchParams.get('redirect');
      const target = (redirect && redirect.startsWith('/') ? redirect : '/dashboard') as import('next').Route;
      router.push(target);
    } catch (err) {
      setError('Não foi possível entrar. Verifique credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">E-mail</label>
        <input
          type="email"
          className="mt-1 input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Senha</label>
        <input
          type="password"
          className="mt-1 input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1 text-sm" role="status" aria-live="polite">
        {error && <p className="text-red-400">{error}</p>}
        {!error && <p className="text-[var(--text-secondary)]">Use um e-mail mock para testar o fluxo.</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
