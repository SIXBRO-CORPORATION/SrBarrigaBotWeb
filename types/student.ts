export type StudentStatus = 'em_dia' | 'devendo' | 'atrasado';

export interface Student {
    id: string;
    name: string;
    phone: string;
    monthlyFee: number;
    startDate: string;
    status: StudentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface StudentSummary {
    id: string;
    name: string;
    phone: string;
    status: StudentStatus;
    balance: number;
}

export interface StudentMonthStatus {
    month: string;
    status: 'pago' | 'devendo' | 'atrasado';
    amountDue: number;
    amountPaid: number;
}

export interface StudentDetail {
    id: string;
    name: string;
    phone: string;
    monthlyFee: number;
    startDate: string;
    status: StudentStatus;
    balance: number;
    statusMesAMes: StudentMonthStatus[];
    payments: import('@/types/payment').Payment[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudentRequest {
    name: string;
    phone: string;
    monthlyFee: number;
    startDate: string;
}

export interface UpdateStudentRequest {
    name?: string;
    phone?: string;
    monthlyFee?: number;
    startDate?: string;
}