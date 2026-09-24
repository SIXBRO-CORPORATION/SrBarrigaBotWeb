export interface PixInfo {
    pixKey: string;
    receiverName: string;
    receiverCity: string;
    payload: string;
}

export interface RegisterPublicPaymentInput {
    matricula: string;
    amount: number;
    note?: string;
    comprovante: File;
}

export interface PublicPaymentResult {
    id: string;
    amount: number;
    paidAt: string;
    status: string;
    createdAt: string;
}
