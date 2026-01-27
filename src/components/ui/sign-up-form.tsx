"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user-service';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await userService.signUp(email, password);
      await userService.updateProfile({
        ...user,
        email,
        username: null,
        displayName: null
      });
      router.push('/auth/complete-profile');
    } catch (err) {
      setError('Erro ao criar conta.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">E-mail</label>
        <input type="email" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Senha</label>
        <input
          type="password"
          className="mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--action)] px-4 py-2 font-semibold text-black transition hover:bg-[var(--action-hover)] disabled:opacity-70"
      >
        {loading ? 'Criando...' : 'Criar conta'}
      </button>
    </form>
  );
}
