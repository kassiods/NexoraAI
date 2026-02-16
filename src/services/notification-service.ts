import { getSupabaseClient } from '@/lib/supabase-client';
import type { NotificationItem } from '@/types/notification';

export const notificationService = {
  async listByUser(userId: string): Promise<NotificationItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (
      data?.map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: (n.kind as NotificationItem['type']) ?? 'system',
        title: n.title ?? '',
        description: n.body ?? '',
        createdAt: new Date(n.created_at ?? Date.now()).getTime(),
        read: n.read ?? false
      })) ?? []
    );
  },

  async markAsRead(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      type: (data.kind as NotificationItem['type']) ?? 'system',
      title: data.title ?? '',
      description: data.body ?? '',
      createdAt: new Date(data.created_at ?? Date.now()).getTime(),
      read: data.read ?? true
    } satisfies NotificationItem;
  }
};
