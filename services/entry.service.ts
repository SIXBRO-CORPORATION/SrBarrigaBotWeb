import { httpClient } from '@/utils/http-client';
import type { Entry, CreateEntryRequest, UpdateEntryRequest } from '@/types/entry';

export const entryService = {
    list: async (): Promise<Entry[]> => {
        const response = await httpClient.get<Entry[]>('/entries');
        return response.data ?? [];
    },

    create: async (data: CreateEntryRequest): Promise<Entry> => {
        const response = await httpClient.post<Entry>('/entries', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateEntryRequest): Promise<Entry> => {
        const response = await httpClient.patch<Entry>(`/entries/${id}`, data);
        return response.data!;
    },

    remove: async (id: string): Promise<Entry> => {
        const response = await httpClient.delete<Entry>(`/entries/${id}`);
        return response.data!;
    },
};
