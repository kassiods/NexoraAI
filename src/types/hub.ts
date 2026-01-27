export type Hub = {
  id: string;
  name: string;
  description: string;
  category: string;
  context?: string;
  status?: 'open' | 'request';
  rules?: string[];
  adminId: string;
  members: string[];
};

export type HubRequest = {
  id: string;
  name: string;
  description: string;
  category: string;
  objective?: string;
  requesterId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: number;
};
