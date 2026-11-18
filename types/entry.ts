export type EntryType = 'GASTO' | 'LUCRO';

export interface Entry {
    id: string;
    type: EntryType;
    title: string;
    details: string | null;
    amount: number;
    createdAt: string;
}

export interface CreateEntryRequest {
    type: EntryType;
    title: string;
    details?: string;
    amount: number;
}

export type UpdateEntryRequest = Partial<CreateEntryRequest>;
