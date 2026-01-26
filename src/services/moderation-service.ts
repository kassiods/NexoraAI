import type { Report } from '@/types/report';

// Mock in-memory reports list to mimic a moderation queue
const reports: Report[] = [];

export const moderationService = {
  async reportContent(targetId: string, targetType: Report['targetType'], reason: string, reporterId: string): Promise<Report> {
    const report: Report = {
      id: `report-${Date.now()}`,
      targetId,
      targetType,
      reason,
      reporterId,
      createdAt: Date.now()
    };
    reports.unshift(report);
    return report;
  },
  async listReports(): Promise<Report[]> {
    return reports;
  }
};
