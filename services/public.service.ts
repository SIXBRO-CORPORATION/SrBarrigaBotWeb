import { httpClient } from '@/utils/http-client';
import type { PixInfo, PublicPaymentResult, RegisterPublicPaymentInput } from '@/types/public-payment';

export const publicService = {
    getPixInfo: async (): Promise<PixInfo> => {
        const response = await httpClient.get<PixInfo>('/public/pix', {
            skipAuth: true,
        });
        return response.data!;
    },

    registerPayment: async (input: RegisterPublicPaymentInput): Promise<PublicPaymentResult> => {
        const formData = new FormData();
        formData.append('matricula', input.matricula);
        formData.append('amount', String(input.amount));
        if (input.note) formData.append('note', input.note);
        formData.append('comprovante', input.comprovante);

        const response = await httpClient.postForm<PublicPaymentResult>('/public/payments', formData, {
            skipAuth: true,
        });
        return response.data!;
    },
};
