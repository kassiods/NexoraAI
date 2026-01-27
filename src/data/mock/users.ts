import type { UserProfile } from '@/types/user';

export const mockUsers: Record<string, UserProfile> = {
  admin: {
    uid: 'admin',
    email: 'admin@nexora.dev',
    username: '@admin',
    displayName: 'Admin Nexora',
    role: 'admin',
    photoURL: null,
    bio: 'Admin mock',
    area: 'Produto',
    areas: ['Produto', 'Estratégia', 'Liderança'],
    hubs: ['web', 'startups'],
    links: { github: 'https://github.com/nexora', linkedin: 'https://linkedin.com' }
  },
  'mock-user': {
    uid: 'mock-user',
    email: 'mock@nexora.dev',
    username: '@mockuser',
    displayName: 'Mock User',
    role: 'user',
    photoURL: null,
    bio: 'Usuário exemplo para testes.',
    area: 'Frontend',
    areas: ['Frontend', 'UI/UX'],
    hubs: ['web', 'design'],
    links: { github: 'https://github.com/mock', linkedin: 'https://linkedin.com' }
  },
  carol: {
    uid: 'carol',
    email: 'carol@nexora.dev',
    username: '@carol',
    displayName: 'Carol Fernandes',
    role: 'user',
    photoURL: null,
    bio: 'Backend e APIs.',
    area: 'Backend',
    areas: ['Backend', 'APIs'],
    hubs: ['backend', 'web'],
    links: { github: 'https://github.com/carol', linkedin: 'https://linkedin.com' }
  },
  maria: {
    uid: 'maria',
    email: 'maria@nexora.dev',
    username: '@maria',
    displayName: 'Maria Souza',
    role: 'user',
    photoURL: null,
    bio: 'Produto e pesquisa.',
    area: 'Produto',
    areas: ['Produto', 'Pesquisa'],
    hubs: ['startups', 'design'],
    links: { github: 'https://github.com/maria', linkedin: 'https://linkedin.com' }
  },
  kassio: {
    uid: 'kassio',
    email: 'kassio@nexora.dev',
    username: '@kassio',
    displayName: 'Kassio',
    role: 'admin',
    photoURL: null,
    bio: 'Admin mock.',
    area: 'Ops',
    areas: ['Ops', 'Produto'],
    hubs: ['web'],
    links: { github: 'https://github.com/kassio', linkedin: 'https://linkedin.com' }
  }
};
