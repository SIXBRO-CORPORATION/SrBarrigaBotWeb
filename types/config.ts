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
} as const;
