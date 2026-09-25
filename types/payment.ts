export type PaymentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface Payment {
    id: string;
    studentId: string;
    studentName?: string;
    amount: number;
    paidAt: string;
    note: string | null;
    receiptUrl: string | null;
    status: PaymentStatus;
    approvedAt: string | null;
    rejectedReason: string | null;
    createdAt: string;
}

export interface RegisterPaymentInput {
    amount: number;
    paidAt: string;
    note?: string;
    comprovante?: File;
}
