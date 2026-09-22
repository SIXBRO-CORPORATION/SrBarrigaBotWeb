import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { STUDENTS_QUERY_KEY } from '@/hooks/useStudents';
import type { RegisterPaymentInput } from '@/types/payment';

export const PAYMENTS_QUERY_KEY = 'payments';

export const useStudentPayments = (studentId: string) => {
    return useQuery({
        queryKey: [PAYMENTS_QUERY_KEY, studentId],
        queryFn: () => paymentService.listByStudent(studentId),
        enabled: !!studentId,
        staleTime: 0,
    });
};

export const useRegisterPayment = (studentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: RegisterPaymentInput) => paymentService.register(studentId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, studentId] });
            queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, studentId] });
        },
    });
};

export const useRemovePayment = (studentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (paymentId: string) => paymentService.remove(paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, studentId] });
            queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, studentId] });
        },
    });
};