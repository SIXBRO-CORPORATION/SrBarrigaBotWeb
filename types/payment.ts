export interface Payment {
    id: string;
    studentId: string;
    amount: number;
    paidAt: string;
    note?: string;
    receiptUrl?: string;
    createdAt: string;
}

export interface RegisterPaymentInput {
    amount: number;
    paidAt: string;
    note?: string;
    comprovante?: File;
}