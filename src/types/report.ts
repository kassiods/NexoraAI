export type Report = {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'hub';
  reason: string;
  reporterId: string;
  reportedUserId?: string;
  summary?: string;
  status?: 'pending' | 'resolved';
  resolutionAction?: string;
  resolutionNote?: string;
  createdAt: number;
};
