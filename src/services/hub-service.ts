import { getSupabaseClient } from '@/lib/supabase-client';
import type { Hub, HubJoinRequest, HubRequest } from '@/types/hub';
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

const mapJoinRequest = (row: any): HubJoinRequest => ({
  id: row.id,
  hubId: row.hub_id,
  userId: row.user_id,
  status: row.status ?? 'pending',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
});

const sendNotification = async (
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string | null | undefined,
  kind: 'hub-join-request' | 'hub-join-response',
  title: string,
  body: string
) => {
  if (!supabase || !userId) return;
  await supabase.from('notifications').insert({ user_id: userId, kind, title, body, read: false });
};

export const hubService = {
  async listHubs(): Promise<Hub[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return mockHubs;
    try {
      const { data, error } = await supabase.from('hubs').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch members map
      const { data: memberships, error: memberError } = await supabase.from('hub_members').select('hub_id, user_id');
      // Se RLS não permitir, continua sem membros para não quebrar a listagem
      const safeMemberships = memberError ? [] : memberships;
      const membersByHub = new Map<string, string[]>();
      safeMemberships?.forEach((m) => {
        const list = membersByHub.get(m.hub_id) ?? [];
        list.push(m.user_id);
        membersByHub.set(m.hub_id, list);
      });

      return (data ?? []).map((h) => mapHub(h, membersByHub.get(h.id)));
    } catch (err) {
      console.error('Falha ao listar hubs, usando mock', err);
      return mockHubs;
    }
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
    // Se não puder ler membros por RLS, segue sem bloquear o hub
    const members = memberError ? [] : memberships?.map((m) => m.user_id) ?? [];
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

  async getJoinState(hubId: string, userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return { status: null as HubJoinRequest['status'] | null, attempts: 0, last: null as HubJoinRequest | null };

    const { data, error } = await supabase
      .from('hub_join_requests')
      .select('*')
      .eq('hub_id', hubId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const last = data?.[0] ? mapJoinRequest(data[0]) : null;
    return { status: last?.status ?? null, attempts: data?.length ?? 0, last };
  },

  async requestMembership(hubId: string, userId: string): Promise<HubJoinRequest> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');

    const { data: member } = await supabase
      .from('hub_members')
      .select('hub_id')
      .eq('hub_id', hubId)
      .eq('user_id', userId)
      .maybeSingle();
    if (member) throw new Error('Você já participa deste hub.');

    const { count: attempts } = await supabase
      .from('hub_join_requests')
      .select('id', { count: 'exact', head: true })
      .eq('hub_id', hubId)
      .eq('user_id', userId);
    if ((attempts ?? 0) >= 3) throw new Error('Limite de 3 pedidos atingido para este hub.');

    const { data: existingPending } = await supabase
      .from('hub_join_requests')
      .select('*')
      .eq('hub_id', hubId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingPending) return mapJoinRequest(existingPending);

    const { data: hubRow } = await supabase.from('hubs').select('admin_id, name').eq('id', hubId).maybeSingle();

    const { data, error } = await supabase
      .from('hub_join_requests')
      .insert({ hub_id: hubId, user_id: userId, status: 'pending' })
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao registrar pedido.');

    await sendNotification(
      supabase,
      hubRow?.admin_id,
      'hub-join-request',
      'Pedido para participar do hub',
      JSON.stringify({
        message: `Você recebeu um pedido para participar do hub ${hubRow?.name ?? ''}`,
        hubId,
        hubName: hubRow?.name ?? '',
        requestId: data.id
      })
    );

    return mapJoinRequest(data);
  },

  async listJoinRequestsForHub(hubId: string): Promise<HubJoinRequest[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('hub_join_requests')
      .select('*')
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapJoinRequest);
  },

  async respondToJoinRequest(id: string, status: Exclude<HubJoinRequest['status'], 'pending'>, actorId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');

    const { data: requestRow, error: fetchError } = await supabase.from('hub_join_requests').select('*').eq('id', id).maybeSingle();
    if (fetchError) throw fetchError;
    if (!requestRow) throw new Error('Pedido não encontrado');

    const { data: hubRow, error: hubError } = await supabase.from('hubs').select('id, admin_id, name').eq('id', requestRow.hub_id).maybeSingle();
    if (hubError) throw hubError;
    if (!hubRow) throw new Error('Hub não encontrado');
    if (hubRow.admin_id !== actorId) throw new Error('Apenas o dono do hub pode responder pedidos.');

    const { data, error } = await supabase
      .from('hub_join_requests')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Não foi possível atualizar o pedido');

    if (status === 'approved') {
      await supabase
        .from('hub_members')
        .upsert({ hub_id: requestRow.hub_id, user_id: requestRow.user_id, role: 'member' }, { onConflict: 'hub_id,user_id' });

      await sendNotification(
        supabase,
        requestRow.user_id,
        'hub-join-response',
        'Pedido aprovado',
        JSON.stringify({
          message: `Seu pedido para participar do hub ${hubRow.name ?? ''} foi aprovado.`,
          hubId: hubRow.id,
          hubName: hubRow.name ?? ''
        })
      );
    } else {
      await sendNotification(
        supabase,
        requestRow.user_id,
        'hub-join-response',
        'Pedido recusado',
        JSON.stringify({
          message: `Seu pedido para participar do hub ${hubRow.name ?? ''} foi recusado.`,
          hubId: hubRow.id,
          hubName: hubRow.name ?? ''
        })
      );
    }

    return mapJoinRequest(data);
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
