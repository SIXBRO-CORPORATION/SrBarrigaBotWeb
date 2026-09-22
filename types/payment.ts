export interface Payment {
    id: string;
    amount: number;
    paidAt: string;
    note: string | null;
    receiptUrl: string | null;
    createdAt: string;
}

export interface RegisterPaymentInput {
    amount: number;
    paidAt: string;
    note?: string;
    comprovante?: File;
}
