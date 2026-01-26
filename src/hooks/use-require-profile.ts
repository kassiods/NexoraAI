import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

export function useRequireProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (!user.username || !user.displayName) {
      router.replace('/auth/complete-profile');
    }
  }, [loading, router, user]);

  return { user, loading };
}
