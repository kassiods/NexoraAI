import Link from 'next/link';
import { SignInForm } from '@/components/ui/sign-in-form';

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-100">Entrar na Nexora</h1>
        <p className="text-sm text-slate-400">Acesse sua conta para continuar colaborando nos hubs.</p>
      </div>
      <SignInForm />
      <div className="flex flex-col gap-2 text-sm text-slate-400">
        <Link href="/auth/reset" className="text-brand-400 hover:text-brand-300">
          Esqueci minha senha
        </Link>
        <p>
          Novo por aqui?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
