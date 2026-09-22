import { httpClient } from '@/utils/http-client';
import type { Payment, RegisterPaymentInput } from '@/types/payment';

export const paymentService = {
    listByStudent: async (studentId: string): Promise<Payment[]> => {
        const response = await httpClient.get<Payment[]>(`/students/${studentId}/payments`);
        return response.data ?? [];
    },

    register: async (studentId: string, input: RegisterPaymentInput): Promise<Payment> => {
        const formData = new FormData();
        formData.append('amount', String(input.amount));
        formData.append('paidAt', input.paidAt);
        if (input.note) formData.append('note', input.note);
        if (input.comprovante) formData.append('comprovante', input.comprovante);

        const response = await httpClient.postForm<Payment>(`/students/${studentId}/payments`, formData);
        return response.data!;
    },

    remove: async (paymentId: string): Promise<Payment> => {
        const response = await httpClient.delete<Payment>(`/payments/${paymentId}`);
        return response.data!;
    },
};