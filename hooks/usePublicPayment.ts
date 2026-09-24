import { useMutation, useQuery } from '@tanstack/react-query';
import { publicService } from '@/services/public.service';
import type { RegisterPublicPaymentInput } from '@/types/public-payment';

export const PIX_INFO_QUERY_KEY = 'public-pix-info';

export const usePixInfo = () => {
    return useQuery({
        queryKey: [PIX_INFO_QUERY_KEY],
        queryFn: publicService.getPixInfo,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });
};

export const useRegisterPublicPayment = () => {
    return useMutation({
        mutationFn: (input: RegisterPublicPaymentInput) => publicService.registerPayment(input),
    });
};
