import type { HubRequest } from '@/types/hub';

export const mockHubRequests: HubRequest[] = [
  {
    id: 'req-1',
    name: 'AI Builders',
    description: 'Trocas sobre MLOps, LLMs em produção e avaliações.',
    category: 'AI/ML',
    objective: 'Compartilhar práticas de deploy e avaliação contínua',
    requesterId: 'carol',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 'req-2',
    name: 'Frontend Testing',
    description: 'Cypress, Playwright, Storybook e acessibilidade.',
    category: 'Tech',
    objective: 'Padrões de testes e DX front-end',
    requesterId: 'mock-user',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24
  }
];
