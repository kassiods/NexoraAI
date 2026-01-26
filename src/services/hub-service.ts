import { mockHubs } from '@/data/mock/hubs';
import type { Hub, HubRequest } from '@/types/hub';

export const hubService = {
  async listHubs(): Promise<Hub[]> {
    return mockHubs;
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
    return { ...data, id: `req-${Date.now()}`, status: 'pending' };
  }
};
