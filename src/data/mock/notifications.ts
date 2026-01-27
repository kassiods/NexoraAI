import type { NotificationItem } from '@/types/notification';

const now = Date.now();

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'mock-user',
    type: 'comment',
    title: 'João comentou no seu projeto API de estudos.',
    description: 'Ele deixou uma pergunta sobre autenticação.',
    createdAt: now - 1000 * 60 * 30,
    read: false
  },
  {
    id: 'n2',
    userId: 'mock-user',
    type: 'invite',
    title: 'Você foi convidado para o hub Backend Brasil.',
    description: 'Convite enviado por Carol.',
    createdAt: now - 1000 * 60 * 60 * 2,
    read: false
  },
  {
    id: 'n3',
    userId: 'mock-user',
    type: 'reply',
    title: 'Maria respondeu ao seu feedback em Nexora MVP.',
    description: 'Ela detalhou as alterações planejadas.',
    createdAt: now - 1000 * 60 * 60 * 26,
    read: false
  },
  {
    id: 'n4',
    userId: 'mock-user',
    type: 'hub-update',
    title: 'Novo post no hub Frontend Brasil.',
    description: 'Atualização semanal publicada.',
    createdAt: now - 1000 * 60 * 60 * 24 * 4,
    read: true
  },
  {
    id: 'n5',
    userId: 'mock-user',
    type: 'hub-approval',
    title: 'Solicitação de hub aprovada.',
    description: 'Seu pedido para o hub Design foi aprovado.',
    createdAt: now - 1000 * 60 * 60 * 24 * 9,
    read: true
  }
];
