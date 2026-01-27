import type { Hub } from '@/types/hub';

export const mockHubs: Hub[] = [
  {
    id: 'web',
    name: 'Desenvolvimento Web',
    category: 'Tech',
    description: 'HTML, CSS, JS, frameworks e deploy.',
    context: 'Discussões sobre APIs, backend e deploy.',
    status: 'open',
    rules: ['Respeito', 'Feedback construtivo', 'Sem spam'],
    adminId: 'admin',
    members: ['admin', 'mock-user']
  },
  {
    id: 'backend',
    name: 'Backend Brasil',
    category: 'Tech',
    description: 'APIs, arquitetura, performance e observabilidade.',
    context: 'Trocas sobre escalabilidade e boas práticas de backend.',
    status: 'request',
    rules: ['Compartilhe contexto', 'Sem autopromoção agressiva'],
    adminId: 'admin',
    members: ['admin']
  },
  {
    id: 'startups',
    name: 'Startups & MVPs',
    category: 'Empreendedorismo',
    description: 'Validação, pitch, growth e MVPs em produção.',
    context: 'Comunidade focada em validação de ideias e MVPs.',
    status: 'open',
    rules: ['Compartilhe métricas quando possível', 'Respeite confidencialidade'],
    adminId: 'admin',
    members: ['admin']
  },
  {
    id: 'design',
    name: 'Design de Produto',
    category: 'Produto',
    description: 'UI/UX, pesquisa, prototipagem e handoff.',
    context: 'Troca de feedback sobre UI, UX e produto.',
    status: 'request',
    adminId: 'mock-user',
    members: ['mock-user'],
    rules: ['Documente referências', 'Feedback educado']
  },
  {
    id: 'mobile',
    name: 'Mobile & APIs',
    category: 'Tech',
    description: 'Integrações mobile, SDKs e API-first.',
    context: 'Discussões sobre APIs, backend e deploy.',
    status: 'open',
    adminId: 'admin',
    members: []
  }
];
