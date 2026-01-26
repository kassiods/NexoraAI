import type { Hub } from '@/types/hub';

export const mockHubs: Hub[] = [
  {
    id: 'web',
    name: 'Desenvolvimento Web',
    category: 'Tech',
    description: 'HTML, CSS, JS, frameworks e deploy.',
    rules: ['Respeito', 'Feedback construtivo', 'Sem spam'],
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
  },
  {
    id: 'design',
    name: 'Design',
    category: 'Produto',
    description: 'UI/UX, pesquisa, prototipagem e handoff.',
    adminId: 'mock-user',
    members: ['mock-user'],
    rules: ['Documente referências', 'Feedback educado']
  }
];
