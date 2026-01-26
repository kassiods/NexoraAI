import type { NotificationItem } from '@/types/notification';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'mock-user',
    type: 'comment',
    title: 'Novo comentário no seu post',
    description: 'Admin comentou no post do hub Web.',
    createdAt: Date.now() - 1000 * 60 * 15,
    read: false
  },
  {
    id: 'n2',
    userId: 'mock-user',
    type: 'hub-approval',
    title: 'Solicitação de hub aprovada',
    description: 'Seu pedido para o hub Design foi aprovado.',
    createdAt: Date.now() - 1000 * 60 * 120,
    read: false
  }
];
