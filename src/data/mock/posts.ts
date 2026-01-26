import type { Comment, Post } from '@/types/post';

export const mockPosts: Post[] = [
  {
    id: 'p1',
    hubId: 'web',
    authorId: 'mock-user',
    content: 'Construindo um MVP em Next.js + Tailwind. Feedback sobre DX e deploy?',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    likes: ['admin']
  },
  {
    id: 'p2',
    hubId: 'web',
    authorId: 'admin',
    content: 'Quais stacks vocês usam para PWA? Preferências por Vercel/Firebase? Vamos discutir.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    likes: ['mock-user']
  },
  {
    id: 'p3',
    hubId: 'startups',
    authorId: 'admin',
    content: 'Validando ideia de app B2B. Busco feedback sobre ICP e pricing inicial.',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    likes: []
  }
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    authorId: 'admin',
    content: 'Considere ISR na landing e Server Actions nos formulários.',
    createdAt: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'c2',
    postId: 'p2',
    authorId: 'mock-user',
    content: 'Tenho usado Workbox light; offline first ficou ok.',
    createdAt: Date.now() - 1000 * 60 * 90
  }
];
