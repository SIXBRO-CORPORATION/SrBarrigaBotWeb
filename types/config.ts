export interface SystemConfig {
    key: string;
    value: string;
    modifiedAt: string;
}

export interface UpdateConfigRequest {
    key: string;
    value: string;
}

export const SYSTEM_CONFIG_KEYS = {
    MONTHLY_FEE: 'monthly_fee',
    BILLING_START_DATE: 'billing_start_date',
    PIX_KEY: 'pix_key',
    PIX_RECEIVER_NAME: 'pix_receiver_name',
    PIX_RECEIVER_CITY: 'pix_receiver_city',
} as const;
