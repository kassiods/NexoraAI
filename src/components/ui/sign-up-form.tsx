"use client";

import { useState } from 'react';
import { userService } from '@/services/user-service';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const strongPassword = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPassword.test(password)) {
      setError('A senha deve ter ao menos 8 caracteres, 1 letra maiúscula e 1 caractere especial.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      setLoading(false);
      return;
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/complete-profile` : undefined;
    try {
      await userService.signUp(email, password, redirectTo);
      setSuccess('Conta criada! Confirme o seu e-mail na sua caixa de entrada para continuar.');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente ou use outro e-mail.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">E-mail</label>
        <input type="email" className="mt-1 input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Senha</label>
        <input
          type="password"
          className="mt-1 input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--text-primary)]">Repita a senha</label>
        <input
          type="password"
          className="mt-1 input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Criando...' : 'Criar conta'}
      </button>
    </form>
  );
}
