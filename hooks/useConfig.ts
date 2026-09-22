import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configService } from '@/services/config.service';
import type { UpdateConfigRequest } from '@/types/config';

export const CONFIG_QUERY_KEY = 'config';

export const useSystemConfig = () => {
    return useQuery({
        queryKey: [CONFIG_QUERY_KEY],
        queryFn: configService.list,
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateConfigRequest) => configService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEY] });
        },
    });
};
