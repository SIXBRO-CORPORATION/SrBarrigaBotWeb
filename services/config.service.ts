import { httpClient } from '@/utils/http-client';
import type { SystemConfig, UpdateConfigRequest } from '@/types/config';

export const configService = {
    get: async (): Promise<SystemConfig> => {
        const response = await httpClient.get<SystemConfig>('/config');
        return response.data!;
    },

    update: async (data: UpdateConfigRequest): Promise<SystemConfig> => {
        const response = await httpClient.patch<SystemConfig>('/config', data);
        return response.data!;
    },
};