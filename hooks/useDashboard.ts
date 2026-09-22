import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = 'dashboard-summary';

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: [DASHBOARD_QUERY_KEY],
        queryFn: dashboardService.getSummary,
    });
};