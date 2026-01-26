import Link from 'next/link';
import { ResetPasswordForm } from '@/components/ui/reset-password-form';

export default function ResetPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-100">Recuperar senha</h1>
        <p className="text-sm text-slate-400">Enviaremos um link para redefinir sua senha.</p>
      </div>
      <ResetPasswordForm />
      <Link href="/auth/login" className="text-sm text-brand-400 hover:text-brand-300">
        Voltar para login
      </Link>
    </div>
  );
}
