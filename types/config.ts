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
    CHARGE_DAY: 'charge_day',
    CHARGE_TIME: 'charge_time',
    CHARGE_MESSAGE_OK: 'charge_message_ok',
    CHARGE_MESSAGE_PENDING: 'charge_message_pending',
} as const;

export const CHARGE_VARIABLES = [
    { name: 'nome', description: 'Nome do aluno' },
    { name: 'mes', description: 'Mês atual por extenso' },
    { name: 'valor_atraso', description: 'Saldo em atraso do aluno' },
    { name: 'mensalidade', description: 'Valor da mensalidade' },
] as const;
