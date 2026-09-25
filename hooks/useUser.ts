import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {userService} from "@/services/user.service";
import {CreateUserRequest, UpdateUserRequest} from "@/types/user";

export const USER_QUERY_KEY = 'users';

export const useUsers = () => {
    return useQuery({
        queryKey: [USER_QUERY_KEY],
        queryFn: () => userService.list(),
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        }
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        }
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        }
    })
}
