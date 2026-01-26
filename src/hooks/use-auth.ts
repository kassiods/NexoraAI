import { useCallback, useEffect, useState } from 'react';
import { userService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const current = await userService.getCurrentUser();
      setUser(current);
      setLoading(false);
    })();
  }, []);

  const signOut = useCallback(async () => {
    await userService.signOut();
    setUser(null);
  }, []);

  return { user, loading, signOut };
}
