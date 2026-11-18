import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entryService } from '@/services/entry.service';
import { DASHBOARD_QUERY_KEY } from '@/hooks/useDashboard';
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types/entry';

export const ENTRIES_QUERY_KEY = 'entries';

export const useEntries = () => {
    return useQuery({
        queryKey: [ENTRIES_QUERY_KEY],
        queryFn: entryService.list,
    });
};

// Lançamentos mudam o total arrecadado, então o dashboard também é invalidado.
const useInvalidateEntries = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: [ENTRIES_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] });
    };
};

export const useCreateEntry = () => {
    const invalidate = useInvalidateEntries();
    return useMutation({
        mutationFn: (data: CreateEntryRequest) => entryService.create(data),
        onSuccess: invalidate,
    });
};

export const useUpdateEntry = () => {
    const invalidate = useInvalidateEntries();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEntryRequest }) =>
            entryService.update(id, data),
        onSuccess: invalidate,
    });
};

export const useRemoveEntry = () => {
    const invalidate = useInvalidateEntries();
    return useMutation({
        mutationFn: (id: string) => entryService.remove(id),
        onSuccess: invalidate,
    });
};
