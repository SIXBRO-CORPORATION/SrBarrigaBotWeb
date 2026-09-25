import { httpClient } from '@/utils/http-client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user';

export const userService = {
    list: async (): Promise<User[]> => {
        const response = await httpClient.get<User[]>('/user');
        return response.data ?? [];
    },

    create: async (data: CreateUserRequest): Promise<User> => {
        const response = await httpClient.post<User>('/user', data);
        return response.data!;
    },

    update: async (id: string, data: UpdateUserRequest): Promise<User> => {
        const response = await httpClient.patch<User>(`/user/${id}`, data);
        return response.data!;
    },

    remove: async (id: string): Promise<User> => {
        const response = await httpClient.delete<User>(`/user/${id}`);
        return response.data!;
    },
};
