"use client";

import { CompleteProfileForm } from '@/components/ui/complete-profile-form';
import { useRequireProfile } from '@/hooks/use-require-profile';

export default function CompleteProfilePage() {
  const { user, loading } = useRequireProfile();

  if (loading) {
    return <p className="text-sm text-slate-400">Carregando...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-100">Complete seu perfil</h1>
        <p className="text-sm text-slate-400">Defina username e dados básicos para interagir na comunidade.</p>
      </div>
      <CompleteProfileForm user={user} />
    </div>
  );
}
