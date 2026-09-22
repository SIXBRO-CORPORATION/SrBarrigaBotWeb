import { httpClient } from '@/utils/http-client';
import type { DashboardSummary } from '@/types/dashboard';

export const dashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await httpClient.get<DashboardSummary>('/dashboard/summary');
        return response.data!;
    },
};