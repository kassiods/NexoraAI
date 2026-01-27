import { mockHubs } from '@/data/mock/hubs';
import { mockHubRequests } from '@/data/mock/hub-requests';
import type { Hub, HubRequest } from '@/types/hub';

const hubRequests: HubRequest[] = [...mockHubRequests];

export const hubService = {
  async listHubs(): Promise<Hub[]> {
    return mockHubs;
  },

  async listHubRequests(): Promise<HubRequest[]> {
    return hubRequests;
  },

  async listCategories(): Promise<string[]> {
    return Array.from(new Set(mockHubs.map((h) => h.category)));
  },

  async getHub(id: string): Promise<Hub | null> {
    return mockHubs.find((h) => h.id === id) ?? null;
  },

  async getUserHubs(userId: string): Promise<Hub[]> {
    return mockHubs.filter((h) => h.members.includes(userId));
  },

  async requestHub(data: Omit<HubRequest, 'id' | 'status'>): Promise<HubRequest> {
    const req: HubRequest = { ...data, id: `req-${Date.now()}`, status: 'pending', createdAt: Date.now() };
    hubRequests.unshift(req);
    return req;
  },

  async updateRequestStatus(id: string, status: HubRequest['status'], feedback?: string) {
    const req = hubRequests.find((r) => r.id === id);
    if (req) {
      req.status = status;
      // feedback placeholder for future audit/logs
      (req as any).feedback = feedback;
    }
    return req;
  }
};
