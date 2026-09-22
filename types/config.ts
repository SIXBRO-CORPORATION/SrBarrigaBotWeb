export interface SystemConfig {
    defaultMonthlyFee: number;
    billingStartDay: number;
    chargeExecutionDay: number;
    chargeExecutionTime: string;
    messageTemplate: string;
}

export interface UpdateConfigRequest {
    defaultMonthlyFee?: number;
    billingStartDay?: number;
    chargeExecutionDay?: number;
    chargeExecutionTime?: string;
    messageTemplate?: string;
}