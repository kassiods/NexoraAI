import type { User } from '@supabase/supabase-js';
import { mockUsers as baseMockUsers } from '@/data/mock/users';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { UserProfile } from '@/types/user';

const LS_KEY = 'nexora_mock_user';
const LS_USERS_KEY = 'nexora_mock_users';

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  role?: 'admin' | 'user' | null;
  photo_url?: string | null;
  bio?: string | null;
  area?: string | null;
  areas?: string[] | null;
  links?: Record<string, string> | null;
  hubs?: string[] | null;
  email?: string | null;
};

const persistUid = (uid: string | null) => {
  if (typeof window === 'undefined') return;
  if (uid) window.localStorage.setItem(LS_KEY, uid);
  else window.localStorage.removeItem(LS_KEY);
};

const loadUid = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LS_KEY);
};

// Caches em memória para evitar chamadas repetidas
let currentUserCache: UserProfile | null = null;
let currentUserPromise: Promise<UserProfile | null> | null = null;
const userCache = new Map<string, UserProfile | null>();

const loadUsers = (): Record<string, UserProfile> => {
  if (typeof window === 'undefined') return baseMockUsers;
  try {
    const stored = window.localStorage.getItem(LS_USERS_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, UserProfile>) : {};
    return { ...baseMockUsers, ...parsed };
  } catch (err) {
    console.error('Erro ao carregar usuários mock do localStorage', err);
    return { ...baseMockUsers };
  }
};

const saveUsers = (users: Record<string, UserProfile>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
};

const mapProfile = (user: User | null, profile?: ProfileRow | null): UserProfile | null => {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email ?? profile?.email ?? '',
    username: profile?.username ?? null,
    displayName: profile?.display_name ?? null,
    role: (profile?.role as UserProfile['role']) ?? 'user',
    photoURL: profile?.photo_url ?? null,
    bio: profile?.bio ?? null,
    area: profile?.area ?? null,
    areas: profile?.areas ?? undefined,
    links: profile?.links ?? undefined,
    hubs: profile?.hubs ?? undefined
  };
};

export const userService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (currentUserCache) return currentUserCache;
    if (currentUserPromise) return currentUserPromise;

    currentUserPromise = (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        const users = loadUsers();
        const uid = loadUid();
        if (!uid) return null;
        const u = users[uid] ?? null;
        currentUserCache = u;
        if (u) userCache.set(u.uid, u);
        return u;
      }
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        const authed = data.user;
        if (!authed) return null;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authed.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        const mapped = mapProfile(authed, profile);
        currentUserCache = mapped;
        if (mapped) userCache.set(mapped.uid, mapped);
        return mapped;
      } catch (err: any) {
        if (err?.name === 'AbortError') return null; // ignora abortos de navegação/hot reload
        throw err;
      } finally {
        currentUserPromise = null;
      }
    })();

    return currentUserPromise;
  },

  async signIn(email: string, _password: string): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const users = loadUsers();
      const found = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        persistUid(found.uid);
        return found;
      }
      const uid = `user-${Date.now()}`;
      const newUser: UserProfile = { uid, email, username: null, displayName: null };
      users[uid] = newUser;
      saveUsers(users);
      persistUid(uid);
      return newUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: _password });
    if (error) throw error;
    const mapped = mapProfile(data.user, null)!;
    currentUserCache = mapped;
    userCache.set(mapped.uid, mapped);
    return mapped;
  },

  async signUp(email: string, _password: string, redirectTo?: string): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.signIn(email, _password);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: _password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
    });
    if (error) throw error;

    const user = data.user;
    if (user?.id) {
      await supabase.from('profiles').upsert({ id: user.id, email });
      // Notificação de boas-vindas
      await supabase.from('notifications').insert({
        user_id: user.id,
        kind: 'system',
        title: 'Bem-vindo à NexoraAI',
        body: 'Obrigado por se juntar! Complete seu perfil em Perfil para começar a interagir.',
        read: false
      });
    }

    const mapped = mapProfile(user, null)!;
    currentUserCache = mapped;
    userCache.set(mapped.uid, mapped);
    return mapped;
  },

  async signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      persistUid(null);
      currentUserCache = null;
      currentUserPromise = null;
      userCache.clear();
      return;
    }
    await supabase.auth.signOut();
    currentUserCache = null;
    currentUserPromise = null;
    userCache.clear();
  },

  async updateProfile(profile: UserProfile) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const users = loadUsers();
      users[profile.uid] = { ...users[profile.uid], ...profile };
      saveUsers(users);
      persistUid(profile.uid);
      const merged = users[profile.uid];
      currentUserCache = merged;
      userCache.set(profile.uid, merged);
      return merged;
    }

    const payload = {
      id: profile.uid,
      username: profile.username,
      display_name: profile.displayName,
      bio: profile.bio,
      area: profile.area,
      areas: profile.areas ?? null,
      links: profile.links ?? null,
      photo_url: profile.photoURL ?? null,
      role: profile.role ?? 'user',
      hubs: profile.hubs ?? null,
      email: profile.email
    } satisfies Partial<ProfileRow> & { id: string };

    const { data, error } = await supabase.from('profiles').upsert(payload).select().maybeSingle();
    if (error) throw error;

    const merged = {
      uid: profile.uid,
      email: profile.email,
      username: data?.username ?? profile.username ?? null,
      displayName: data?.display_name ?? profile.displayName ?? null,
      role: (data?.role as UserProfile['role']) ?? profile.role,
      photoURL: data?.photo_url ?? profile.photoURL ?? null,
      bio: data?.bio ?? profile.bio ?? null,
      area: data?.area ?? profile.area ?? null,
      areas: (data?.areas as string[] | null) ?? profile.areas,
      links: (data?.links as UserProfile['links']) ?? profile.links,
      hubs: (data?.hubs as string[] | null) ?? profile.hubs
    } satisfies UserProfile;

    currentUserCache = merged;
    userCache.set(profile.uid, merged);
    return merged;
  },

  async getById(uid: string) {
    if (userCache.has(uid)) return userCache.get(uid) ?? null;

    const supabase = getSupabaseClient();
    if (!supabase) {
      const users = loadUsers();
      const u = users[uid] ?? null;
      if (u) userCache.set(uid, u);
      return u;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const mapped = {
      uid: data.id,
      email: data.email ?? '',
      username: data.username ?? null,
      displayName: data.display_name ?? null,
      role: (data.role as UserProfile['role']) ?? 'user',
      photoURL: data.photo_url ?? null,
      bio: data.bio ?? null,
      area: data.area ?? null,
      areas: (data.areas as string[] | null) ?? undefined,
      links: (data.links as UserProfile['links']) ?? undefined,
      hubs: data.hubs ?? undefined
    } satisfies UserProfile;

    userCache.set(uid, mapped);
    return mapped;
  }
};
