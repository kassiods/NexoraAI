import { Suspense } from 'react';
import Link from 'next/link';
import { SignInForm } from '@/components/ui/sign-in-form';

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Entrar na Nexora</h1>
        <p className="text-sm text-[var(--text-secondary)]">Acesse sua conta para continuar colaborando nos hubs.</p>
      </div>
      <Suspense fallback={<div className="text-sm text-[var(--text-secondary)]">Carregando...</div>}>
        <SignInForm />
      </Suspense>
      <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/auth/reset" className="text-[var(--action)] hover:text-[var(--action-hover)]">
          Esqueci minha senha
        </Link>
        <p>
          Novo por aqui?{' '}
          <Link href="/auth/register" className="text-[var(--action)] hover:text-[var(--action-hover)]">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
