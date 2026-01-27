import type { UserProfile } from '@/types/user';

export const mockUsers: Record<string, UserProfile> = {
  admin: {
    uid: 'admin',
    email: 'admin@nexora.dev',
    username: '@admin',
    displayName: 'Admin Nexora',
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
    photoURL: null,
    bio: 'Usuário exemplo para testes.',
    area: 'Frontend',
    areas: ['Frontend', 'UI/UX'],
    hubs: ['web', 'design'],
    links: { github: 'https://github.com/mock', linkedin: 'https://linkedin.com' }
  }
};
