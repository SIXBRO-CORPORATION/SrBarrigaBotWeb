import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { STUDENTS_QUERY_KEY } from '@/hooks/useStudents';
import { DASHBOARD_QUERY_KEY } from '@/hooks/useDashboard';
import type { RegisterPaymentInput } from '@/types/payment';

export const PAYMENTS_QUERY_KEY = 'payments';
export const PENDING_PAYMENTS_QUERY_KEY = 'payments-pending';

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

export const usePendingPayments = () => {
    return useQuery({
        queryKey: [PENDING_PAYMENTS_QUERY_KEY],
        queryFn: paymentService.listPending,
        refetchInterval: 30 * 1000,
    });
};

const invalidatePendingPaymentEffects = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: [PENDING_PAYMENTS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] });
};

export const useApprovePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (paymentId: string) => paymentService.approve(paymentId),
        onSuccess: () => invalidatePendingPaymentEffects(queryClient),
    });
};

export const useRejectPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
            paymentService.reject(paymentId, reason),
        onSuccess: () => invalidatePendingPaymentEffects(queryClient),
    });
};