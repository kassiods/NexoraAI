export type NotificationItem = {
  id: string;
  userId: string;
  type: 'comment' | 'hub-approval' | 'like';
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
};
