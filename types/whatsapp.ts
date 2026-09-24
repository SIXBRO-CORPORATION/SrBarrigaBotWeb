export interface WhatsAppStatus {
    isConnected: boolean;
    needsQR: boolean;
}

export interface WhatsAppQREvent {
    type: 'qr' | 'connected' | 'disconnected';
    qrCode?: string;
}

export type ChargeStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface ChargeProgress {
    status: ChargeStatus;
    total: number;
    sent: number;
    failed: number;
    error?: string;
    startedAt?: string;
    finishedAt?: string;
}
