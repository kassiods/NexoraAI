import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

export function useRequireProfile() {
  const { user, loading, hasSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!hasSession) {
      router.replace('/auth/login');
      return;
    }
    if (!user) return; // ainda carregando perfil
    // Só redireciona para completar perfil se faltarem ambos os campos de identidade
    const needsProfile = !user.username && !user.displayName;
    if (needsProfile) {
      router.replace('/auth/complete-profile');
    }
  }, [loading, hasSession, router, user]);

  return { user, loading };
}
