import type { Report } from '@/types/report';
import { mockReports } from '@/data/mock/reports';

// Mock in-memory reports list to mimic a moderation queue
const reports: Report[] = [...mockReports];

export const moderationService = {
  async reportContent(targetId: string, targetType: Report['targetType'], reason: string, reporterId: string): Promise<Report> {
    const report: Report = {
      id: `report-${Date.now()}`,
      targetId,
      targetType,
      reason,
      reporterId,
      status: 'pending',
      createdAt: Date.now()
    };
    reports.unshift(report);
    return report;
  },
  async listReports(): Promise<Report[]> {
    return reports;
  },
  async resolveReport(id: string, action?: string, note?: string) {
    const report = reports.find((r) => r.id === id);
    if (report) {
      report.status = 'resolved';
      if (action) report.resolutionAction = action;
      if (note) report.resolutionNote = note;
    }
    return report;
  }
};
