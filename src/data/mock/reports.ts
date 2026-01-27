import type { Report } from '@/types/report';

export const mockReports: Report[] = [
  {
    id: 'r1',
    targetId: 'p4',
    targetType: 'post',
    reason: 'Possível divulgação indevida',
    reporterId: 'mock-user',
    reportedUserId: 'carol',
    summary: 'Post mencionando serviço pago sem contexto',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'r2',
    targetId: 'c2',
    targetType: 'comment',
    reason: 'Tom agressivo',
    reporterId: 'carol',
    reportedUserId: 'mock-user',
    summary: 'Comentário soa hostil com outro membro',
    status: 'resolved',
    resolutionAction: 'Comentários bloqueados por 7 dias',
    resolutionNote: 'Primeira ocorrência, bloqueio curto.',
    createdAt: Date.now() - 1000 * 60 * 60 * 20
  },
  {
    id: 'r3',
    targetId: 'p1',
    targetType: 'post',
    reason: 'Spam recorrente e autopromoção',
    reporterId: 'maria',
    reportedUserId: 'mock-user',
    summary: 'Links repetidos de serviço próprio',
    status: 'resolved',
    resolutionAction: 'Conta banida permanentemente',
    resolutionNote: 'Violação repetida após avisos.',
    createdAt: Date.now() - 1000 * 60 * 60 * 36
  },
  {
    id: 'r4',
    targetId: 'c4',
    targetType: 'comment',
    reason: 'Conteúdo fora do escopo do hub',
    reporterId: 'admin',
    reportedUserId: 'mock-user',
    summary: 'Comentário com autopromo de template',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 80
  },
  {
    id: 'r5',
    targetId: 'mock-user',
    targetType: 'user',
    reason: 'Conta suspeita: múltiplos relatos',
    reporterId: 'admin',
    reportedUserId: 'mock-user',
    summary: 'Solicitação de revisão da conta',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 15
  }
];
