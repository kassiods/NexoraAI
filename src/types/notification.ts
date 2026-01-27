export type NotificationItem = {
  id: string;
  userId: string;
  type: 'comment' | 'hub-approval' | 'like' | 'invite' | 'reply' | 'hub-update';
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
};
