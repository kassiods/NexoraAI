import { mockUsers as baseMockUsers } from '@/data/mock/users';
import type { UserProfile } from '@/types/user';

const LS_KEY = 'nexora_mock_user';
const LS_USERS_KEY = 'nexora_mock_users';

const persistUid = (uid: string | null) => {
  if (typeof window === 'undefined') return;
  if (uid) window.localStorage.setItem(LS_KEY, uid);
  else window.localStorage.removeItem(LS_KEY);
};

const loadUid = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LS_KEY);
};

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

export const userService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const users = loadUsers();
    const uid = loadUid();
    if (!uid) return null;
    return users[uid] ?? null;
  },

  async signIn(email: string, _password: string): Promise<UserProfile> {
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
  },

  async signUp(email: string, _password: string): Promise<UserProfile> {
    return this.signIn(email, _password);
  },

  async signOut() {
    persistUid(null);
  },

  async updateProfile(profile: UserProfile) {
    const users = loadUsers();
    users[profile.uid] = { ...users[profile.uid], ...profile };
    saveUsers(users);
    persistUid(profile.uid);
    return users[profile.uid];
  },

  async getById(uid: string) {
    const users = loadUsers();
    return users[uid] ?? null;
  }
};
