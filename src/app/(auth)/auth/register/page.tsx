import Link from 'next/link';
import { SignUpForm } from '@/components/ui/sign-up-form';

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-100">Criar conta</h1>
        <p className="text-sm text-slate-400">Cadastre-se para solicitar hubs, enviar posts e receber feedback.</p>
      </div>
      <SignUpForm />
      <p className="text-sm text-slate-400">
        Já tem conta?{' '}
        <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">
          Entrar
        </Link>
      </p>
    </div>
  );
}
