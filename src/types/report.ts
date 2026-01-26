export type Report = {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  reporterId: string;
  createdAt: number;
};
