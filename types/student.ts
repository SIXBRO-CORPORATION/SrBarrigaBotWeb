export type BillingStatus = 'EM_DIA' | 'ATRASADO' | 'ADIANTADO';

export interface Student {
    id: string;
    name: string;
    matricula: string;
    phone: string;
    active: boolean;
    inactivatedAt: string | null;
    createdAt: string;
}

export interface StudentSummary {
    student: Student;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: BillingStatus;
}

export interface StudentMonthStatus {
    numero: number;
    referencia: string;
    status: 'OK' | 'PENDENTE';
}

export interface StudentDetail {
    student: Student;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: BillingStatus;
    statusMesAMes: StudentMonthStatus[];
    payments: import('@/types/payment').Payment[];
}

export interface CreateStudentRequest {
    name: string;
    matricula: string;
    phone: string;
}

export interface UpdateStudentRequest {
    name?: string;
    matricula?: string;
    phone?: string;
}
