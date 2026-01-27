import { mockNotifications } from '@/data/mock/notifications';
import type { NotificationItem } from '@/types/notification';

export const notificationService = {
  async listByUser(userId: string): Promise<NotificationItem[]> {
    const byUser = mockNotifications.filter((n) => n.userId === userId);
    const fallback = byUser.length > 0 ? byUser : mockNotifications;
    return fallback.sort((a, b) => b.createdAt - a.createdAt);
  },

  async markAsRead(id: string) {
    const n = mockNotifications.find((n) => n.id === id);
    if (n) n.read = true;
    return n;
  }
};
