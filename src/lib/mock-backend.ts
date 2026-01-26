import type { Hub, HubRequest } from '@/types/hub';
import type { Comment, Post } from '@/types/post';
import type { UserProfile } from '@/types/user';

const LS_KEY = 'nexora_mock_user';

const hubs: Hub[] = [
  {
    id: 'web',
    name: 'Desenvolvimento Web',
    category: 'Tech',
    description: 'HTML, CSS, JS, frameworks e deploy.',
    rules: ['Respeito', 'Feedbacks construtivos', 'Sem spam'],
    adminId: 'admin',
    members: ['admin', 'mock-user']
  },
  {
    id: 'startups',
    name: 'Startups',
    category: 'Empreendedorismo',
    description: 'Validação, pitch e growth.',
    rules: ['Compartilhe contexto', 'Sem autopromoção agressiva'],
    adminId: 'admin',
    members: ['admin']
  }
];

const posts: Post[] = [
  {
    id: 'p1',
    hubId: 'web',
    authorId: 'mock-user',
    content: 'Construindo um MVP em Next.js + Tailwind. Gostaria de feedback sobre DX e deploy.',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    likes: ['admin']
  },
  {
    id: 'p2',
    hubId: 'web',
    authorId: 'admin',
    content: 'Compartilhem stacks favoritas para PWA.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    likes: ['mock-user']
  }
];

const comments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    authorId: 'admin',
    content: 'Considere usar incremental static regen para landing pública e Server Actions para formulários.',
    createdAt: Date.now() - 1000 * 60 * 30
  }
];

const users: Record<string, UserProfile> = {
  admin: {
    uid: 'admin',
    email: 'admin@nexora.dev',
    username: '@admin',
    displayName: 'Admin Nexora',
    photoURL: null,
    bio: 'Admin mock',
    area: 'Produto',
    hubs: ['web', 'startups'],
    links: { github: 'https://github.com/nexora', linkedin: 'https://linkedin.com' }
  },
  'mock-user': {
    uid: 'mock-user',
    email: 'mock@nexora.dev',
    username: '@mockuser',
    displayName: 'Mock User',
    photoURL: null,
    bio: 'Usuário exemplo para testes.',
    area: 'Frontend',
    hubs: ['web'],
    links: { github: 'https://github.com/mock', linkedin: 'https://linkedin.com' }
  }
};

function persist(uid: string | null) {
  if (typeof window === 'undefined') return;
  if (uid) {
    window.localStorage.setItem(LS_KEY, uid);
  } else {
    window.localStorage.removeItem(LS_KEY);
  }
}

function loadUid(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LS_KEY);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const uid = loadUid();
  if (!uid) return null;
  return users[uid] ?? null;
}

export async function signInMock(email: string, _password: string): Promise<UserProfile> {
  const found = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    const uid = `user-${Date.now()}`;
    const newUser: UserProfile = {
      uid,
      email,
      username: null,
      displayName: null
    };
    users[uid] = newUser;
    persist(uid);
    return newUser;
  }
  persist(found.uid);
  return found;
}

export async function signUpMock(email: string, _password: string): Promise<UserProfile> {
  const existing = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    persist(existing.uid);
    return existing;
  }
  const uid = `user-${Date.now()}`;
  const newUser: UserProfile = {
    uid,
    email,
    username: null,
    displayName: null
  };
  users[uid] = newUser;
  persist(uid);
  return newUser;
}

export async function signOutMock() {
  persist(null);
}

export async function upsertUserProfileMock(profile: UserProfile) {
  users[profile.uid] = { ...users[profile.uid], ...profile };
  persist(profile.uid);
  return users[profile.uid];
}

export async function listHubsMock(): Promise<Hub[]> {
  return hubs;
}

export async function getHubMock(id: string): Promise<Hub | null> {
  return hubs.find((h) => h.id === id) ?? null;
}

export async function listPostsForHubMock(hubId: string): Promise<{ posts: Post[]; comments: Comment[] }> {
  return {
    posts: posts.filter((p) => p.hubId === hubId),
    comments: comments.filter((c) => posts.some((p) => p.id === c.postId && p.hubId === hubId))
  };
}

export async function addPostMock(hubId: string, authorId: string, content: string): Promise<Post> {
  const post: Post = {
    id: `post-${Date.now()}`,
    hubId,
    authorId,
    content,
    createdAt: Date.now(),
    likes: []
  };
  posts.unshift(post);
  return post;
}

export async function submitHubRequestMock(request: Omit<HubRequest, 'id' | 'status'>): Promise<HubRequest> {
  return {
    ...request,
    id: `req-${Date.now()}`,
    status: 'pending'
  };
}
