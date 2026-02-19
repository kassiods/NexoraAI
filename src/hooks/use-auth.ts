import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { userService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';

const softTimeout = async <T>(promise: Promise<T>, fallback: T, ms = 3000): Promise<{ value: T; timedOut: boolean }> => {
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
  }, ms);
  const val = await Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
  clearTimeout(timer);
  return { value: val, timedOut };
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cachedUser, setCachedUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem('nexora_last_user');
      return stored ? (JSON.parse(stored) as UserProfile) : null;
    } catch (_err) {
      return null;
    }
  });
  const [hasSession, setHasSession] = useState<boolean>(() => !!(typeof window !== 'undefined' && cachedUser));
  const [loading, setLoading] = useState(true);

  const rememberUser = (u: UserProfile | null) => {
    if (typeof window !== 'undefined') {
      if (u) window.localStorage.setItem('nexora_last_user', JSON.stringify(u));
      else window.localStorage.removeItem('nexora_last_user');
    }
    setCachedUser(u);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          const current = await userService.getCurrentUser();
          if (!active) return;
          setUser(current);
          rememberUser(current);
          setHasSession(!!current);
          setLoading(false);
          return;
        }

        const { value: sessionRes, timedOut } = await softTimeout(supabase.auth.getSession(), { data: { session: null }, error: null } as any);
        const { data, error } = sessionRes as any;
        if (error) throw error;

        if (!data.session) {
          // Tenta obter usuário mesmo sem sessão (pode haver token em cache)
          const { value: userRes } = await softTimeout(supabase.auth.getUser(), { data: { user: null }, error: null } as any);
          const { data: userData, error: userErr } = userRes as any;
          if (userErr || !userData.user) {
            if (!active) return;
            if (cachedUser) {
              setUser(cachedUser);
              setHasSession(true);
            } else {
              setUser(null);
              setHasSession(false);
            }
            setLoading(false);
            return;
          }
          // Há usuário, assume sessão válida
          if (!active) return;
          setHasSession(true);
          const basic = {
            uid: userData.user.id,
            email: userData.user.email ?? '',
            username: userData.user.user_metadata?.username ?? null,
            displayName: (userData.user.user_metadata as any)?.full_name ?? userData.user.email ?? null,
            role: 'user',
            photoURL: (userData.user.user_metadata as any)?.avatar_url ?? null
          } satisfies UserProfile;
          setUser(basic);
          rememberUser(basic);
          setLoading(false);
          return;
        }

        setHasSession(true);

        try {
          const current = await userService.getCurrentUser();
          if (!active) return;
          if (current) {
            setUser(current);
            rememberUser(current);
          } else {
            const s = data.session;
            const basic = {
              uid: s.user.id,
              email: s.user.email ?? '',
              username: s.user.user_metadata?.username ?? null,
              displayName: (s.user.user_metadata as any)?.full_name ?? s.user.email ?? null,
              role: 'user',
              photoURL: (s.user.user_metadata as any)?.avatar_url ?? null
            } satisfies UserProfile;
            setUser(basic);
            rememberUser(basic);
          }
        } catch (profileErr) {
          console.error('Erro ao buscar perfil, usando sessão básica', profileErr);
          if (!active) return;
          const s = data.session;
          const basic = {
            uid: s.user.id,
            email: s.user.email ?? '',
            username: s.user.user_metadata?.username ?? null,
            displayName: (s.user.user_metadata as any)?.full_name ?? s.user.email ?? null,
            role: 'user',
            photoURL: (s.user.user_metadata as any)?.avatar_url ?? null
          } satisfies UserProfile;
          setUser(basic);
          rememberUser(basic);
        }
      } catch (err: any) {
        console.error('Erro ao carregar usuário atual', err);
        if (!active) return;
        if (err?.message === 'timeout' && cachedUser) {
          setUser(cachedUser);
          setHasSession(true);
        } else {
          if (cachedUser) {
            setUser(cachedUser);
            setHasSession(true);
          } else {
            setUser(null);
            setHasSession(false);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Removido failsafe agressivo: preferimos esperar a resposta real para não derrubar sessão

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const current = await userService.getCurrentUser();
          setUser(current);
          rememberUser(current);
          setHasSession(true);
        } else {
          setUser(null);
          rememberUser(null);
          setHasSession(false);
        }
      } catch (err) {
        console.error('Erro ao atualizar sessão', err);
        setUser(null);
        rememberUser(null);
        setHasSession(false);
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
    rememberUser(null);
    setHasSession(false);
  }, []);

  return { user, loading, signOut, hasSession };
}
