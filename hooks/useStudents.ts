import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import type { CreateStudentRequest, UpdateStudentRequest } from '@/types/student';

export const STUDENTS_QUERY_KEY = 'students';

export const useStudents = () => {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY],
        queryFn: studentService.list,
    });
};

export const useStudentDetail = (id: string) => {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY, id],
        queryFn: () => studentService.getDetail(id),
        enabled: !!id,
    });
};

export const useStudentTimeline = (id: string) => {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY, id, 'timeline'],
        queryFn: () => studentService.getTimeline(id),
        enabled: !!id,
    });
};

export const useCreateStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStudentRequest) => studentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
        },
    });
};

export const useUpdateStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStudentRequest }) =>
            studentService.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, variables.id] });
        },
    });
};

export const useRemoveStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => studentService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
        },
    });
};