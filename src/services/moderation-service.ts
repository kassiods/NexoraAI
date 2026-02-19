import { getSupabaseClient } from '@/lib/supabase-client';
import type { Report } from '@/types/report';

const mapReport = (row: any): Report => ({
  id: row.id,
  targetId: row.target_id,
  targetType: row.target_type,
  reason: row.reason ?? '',
  reporterId: row.reporter_id ?? '',
  reportedUserId: row.reported_user_id ?? undefined,
  summary: row.summary ?? undefined,
  status: (row.status as Report['status']) ?? 'pending',
  resolutionAction: row.resolution_action ?? undefined,
  resolutionNote: row.resolution_note ?? undefined,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
});

export const moderationService = {
  async reportContent(targetId: string, targetType: Report['targetType'], reason: string, reporterId: string): Promise<Report> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const payload = {
      target_id: targetId,
      target_type: targetType,
      reason,
      reporter_id: reporterId,
      status: 'pending' as const
    };
    const { data, error } = await supabase.from('reports').insert(payload).select('*').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao criar denúncia');
    return mapReport(data);
  },

  async listReports(): Promise<Report[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapReport);
  },

  async resolveReport(id: string, action?: string, note?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('reports')
      .update({ status: 'resolved', resolution_action: action ?? null, resolution_note: note ?? null })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data ? mapReport(data) : null;
  }
};
