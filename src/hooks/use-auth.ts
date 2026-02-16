import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { userService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const current = await userService.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Erro ao carregar usuário atual', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const current = await userService.getCurrentUser();
          setUser(current);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao atualizar sessão', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await userService.signOut();
    setUser(null);
  }, []);

  return { user, loading, signOut };
}
