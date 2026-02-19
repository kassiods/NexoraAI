import { getSupabaseClient } from '@/lib/supabase-client';
import type { Hub, HubRequest } from '@/types/hub';
import { mockHubs } from '@/data/mock/hubs';

const genId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `hub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const mapHub = (row: any, members?: string[]): Hub => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  category: row.category ?? '',
  context: row.context ?? undefined,
  status: row.status ?? 'open',
  rules: (row.rules as string[] | null) ?? undefined,
  adminId: row.admin_id ?? '',
  members,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
});

const mapRequest = (row: any): HubRequest => ({
  id: row.id,
  name: row.hub_name ?? row.name ?? '',
  description: row.description ?? '',
  category: row.category ?? '',
  objective: row.objective ?? undefined,
  requesterId: row.requester_id ?? '',
  status: (row.status as HubRequest['status']) ?? 'pending',
  feedback: row.feedback ?? null,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
});

export const hubService = {
  async listHubs(): Promise<Hub[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return mockHubs;

    const { data, error } = await supabase.from('hubs').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch members map
    const { data: memberships, error: memberError } = await supabase.from('hub_members').select('hub_id, user_id');
    if (memberError) throw memberError;
    const membersByHub = new Map<string, string[]>();
    memberships?.forEach((m) => {
      const list = membersByHub.get(m.hub_id) ?? [];
      list.push(m.user_id);
      membersByHub.set(m.hub_id, list);
    });

    return (data ?? []).map((h) => mapHub(h, membersByHub.get(h.id)));
  },

  async listHubRequests(): Promise<HubRequest[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from('hub_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRequest);
  },

  async listCategories(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return Array.from(new Set(mockHubs.map((h) => h.category).filter(Boolean)));
    const { data, error } = await supabase.from('hubs').select('category');
    if (error) throw error;
    const categories = new Set<string>();
    data?.forEach((row) => {
      if (row.category) categories.add(row.category);
    });
    return Array.from(categories);
  },

  async getHub(id: string): Promise<Hub | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return mockHubs.find((h) => h.id === id) ?? null;
    const { data, error } = await supabase.from('hubs').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { data: memberships, error: memberError } = await supabase.from('hub_members').select('user_id').eq('hub_id', id);
    if (memberError) throw memberError;
    const members = memberships?.map((m) => m.user_id) ?? [];
    return mapHub(data, members);
  },

  async getUserHubs(userId: string): Promise<Hub[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return mockHubs.filter((h) => h.members?.includes(userId));
    const { data: membershipRows, error: membershipError } = await supabase.from('hub_members').select('hub_id').eq('user_id', userId);
    if (membershipError) throw membershipError;
    const hubIds = membershipRows?.map((m) => m.hub_id) ?? [];
    if (hubIds.length === 0) return [];
    const { data: hubs, error } = await supabase.from('hubs').select('*').in('id', hubIds);
    if (error) throw error;
    return (hubs ?? []).map((h) => mapHub(h, hubIds.includes(h.id) ? undefined : undefined));
  },

  async requestHub(data: Omit<HubRequest, 'id' | 'status' | 'feedback' | 'createdAt'>): Promise<HubRequest> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const payload = {
      name: data.name,
      description: data.description,
      category: data.category,
      objective: data.objective ?? null,
      requester_id: data.requesterId,
      status: 'pending' as const
    };
    const { data: inserted, error } = await supabase.from('hub_requests').insert(payload).select('*').maybeSingle();
    if (error) {
      const message = error.message ?? 'Falha ao criar solicitação';
      throw new Error(message);
    }
    if (!inserted) throw new Error('Falha ao criar solicitação');
    return mapRequest(inserted);
  },

  async updateRequestStatus(id: string, status: HubRequest['status'], feedback?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    // Busca a solicitação para usar os dados ao aprovar
    const { data: existing, error: fetchError } = await supabase.from('hub_requests').select('*').eq('id', id).maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Solicitação não encontrada');

    const payload = { status, ...(feedback !== undefined ? { feedback } : {}) } as any;
    const { data, error } = await supabase.from('hub_requests').update(payload).eq('id', id).select('*').maybeSingle();
    if (error) {
      const message = error.message ?? 'Falha ao atualizar solicitação';
      throw new Error(message);
    }
    if (!data) throw new Error('Solicitação não encontrada');

    // Se aprovou, cria hub e adiciona solicitante como admin/membro
    if (status === 'approved') {
      const hubPayload = {
        id: genId(),
        name: existing.name ?? existing.hub_name ?? 'Hub sem nome',
        description: existing.description ?? '',
        category: existing.category ?? 'Geral',
        context: existing.objective ?? null,
        status: 'open',
        admin_id: existing.requester_id ?? null
      } as const;

      const { data: hubRow, error: hubError } = await supabase.from('hubs').insert(hubPayload).select('id').maybeSingle();
      if (hubError) throw hubError;

      if (hubRow?.id && existing.requester_id) {
        // adiciona solicitante como membro/admin
        await supabase.from('hub_members').upsert({ hub_id: hubRow.id, user_id: existing.requester_id, role: 'admin' }, { onConflict: 'hub_id,user_id' });
      }
    }

    return mapRequest(data);
  }
};
