'use client';

import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { DashboardLayout } from '@/components/app/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { SettingsSkeleton } from '@/components/app/SettingsSkeleton';
import { useToast } from '@/providers/ToastProvider';
import { useSystemConfig, useUpdateSystemConfig } from '@/hooks/useConfig';
import { usePixInfo, PIX_INFO_QUERY_KEY } from '@/hooks/usePublicPayment';
import { CHARGE_VARIABLES, SYSTEM_CONFIG_KEYS } from '@/types/config';
import type { SystemConfig, UpdateConfigRequest } from '@/types/config';

const CHARGE_KEYS = [
    SYSTEM_CONFIG_KEYS.CHARGE_DAY,
    SYSTEM_CONFIG_KEYS.CHARGE_TIME,
    SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_OK,
    SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_PENDING,
];

function findValue(configs: SystemConfig[] | undefined, key: string): string {
    return configs?.find((c) => c.key === key)?.value ?? '';
}

function latestModifiedAt(configs: SystemConfig[] | undefined, keys: string[]): string | undefined {
    return keys
        .map((key) => configs?.find((c) => c.key === key)?.modifiedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1);
}

function formatModifiedAt(value?: string): string | null {
    if (!value) return null;
    return `ATUALIZADO EM ${new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`;
}

interface ConfigBlockShellProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function ConfigBlockShell({ title, description, icon, children }: ConfigBlockShellProps) {
    return (
        <div className="relative">
            <div className="absolute -inset-1 bg-white/10 blur-xl" />
            <div className="relative bg-[#0A0A0A] border-2 border-white chamfer p-6 lg:p-8">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative space-y-6">
                    <div className="flex items-start gap-4 pb-5 border-b border-white/10">
                        <div className="w-11 h-11 shrink-0 bg-white/10 flex items-center justify-center chamfer-sm text-white">
                            {icon}
                        </div>
                        <div>
                            <h2 className="text-lg text-white tracking-wide">{title}</h2>
                            <p className="text-sm text-white/50 body-text mt-1">{description}</p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

interface BlockFooterProps {
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
    modifiedAtLabel: string | null;
}

function BlockFooter({ isDirty, isSaving, onSave, modifiedAtLabel }: BlockFooterProps) {
    return (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <p className="text-xs tech-text text-white/30 tracking-widest">
                {modifiedAtLabel ?? ''}
            </p>
            <Button.Root
                type="button"
                variant="primary"
                size="md"
                loading={isSaving}
                disabled={isSaving || !isDirty}
                onClick={onSave}
                className="w-full sm:w-auto"
            >
                <Button.Text>{isSaving ? 'SALVANDO...' : 'SALVAR'}</Button.Text>
            </Button.Root>
        </div>
    );
}

const CurrencyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0-14a9 9 0 100 18 9 9 0 000-18z" />
    </svg>
);

const PixIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const MessageIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.4-3.7C3.5 15.1 3 13.6 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

interface MonthlyFeeBlockProps {
    configs?: SystemConfig[];
}

function MonthlyFeeBlock({ configs }: MonthlyFeeBlockProps) {
    const { success, error: showError } = useToast();
    const updateMutation = useUpdateSystemConfig();

    const savedAmount = findValue(configs, SYSTEM_CONFIG_KEYS.MONTHLY_FEE);
    const savedBillingStartDate = findValue(configs, SYSTEM_CONFIG_KEYS.BILLING_START_DATE);

    const [amount, setAmount] = useState(savedAmount);
    const [billingStartDate, setBillingStartDate] = useState(savedBillingStartDate);
    const [errors, setErrors] = useState<{ amount?: string; billingStartDate?: string }>({});

    const dirty = {
        amount: amount !== savedAmount,
        billingStartDate: billingStartDate !== savedBillingStartDate,
    };
    const isDirty = dirty.amount || dirty.billingStartDate;
    const isSaving = updateMutation.isPending;

    const handleSave = async () => {
        const newErrors: typeof errors = {};

        const parsedAmount = Number(amount.replace(',', '.'));
        if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount < 0) {
            newErrors.amount = 'Informe um valor numérico válido, maior ou igual a zero';
        }

        if (!billingStartDate.trim()) {
            newErrors.billingStartDate = 'Informe uma data válida';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            await Promise.all([
                dirty.amount &&
                    updateMutation.mutateAsync({ key: SYSTEM_CONFIG_KEYS.MONTHLY_FEE, value: parsedAmount.toFixed(2) }),
                dirty.billingStartDate &&
                    updateMutation.mutateAsync({ key: SYSTEM_CONFIG_KEYS.BILLING_START_DATE, value: billingStartDate.trim() }),
            ]);
            success('Configurações de mensalidade atualizadas com sucesso');
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Erro ao atualizar as configurações de mensalidade');
        }
    };

    const modifiedAtLabel = formatModifiedAt(
        latestModifiedAt(configs, [SYSTEM_CONFIG_KEYS.MONTHLY_FEE, SYSTEM_CONFIG_KEYS.BILLING_START_DATE]),
    );

    return (
        <ConfigBlockShell
            title="MENSALIDADE"
            description="Valor cobrado de cada aluno e a partir de quando a cobrança passa a valer."
            icon={<CurrencyIcon />}
        >
            <Input.Group>
                <Input.Root
                    label="VALOR DA MENSALIDADE (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    error={errors.amount}
                    disabled={isSaving}
                />

                <Input.Root
                    label="DATA DE INÍCIO DA COBRANÇA"
                    type="date"
                    value={billingStartDate}
                    onChange={(e) => {
                        setBillingStartDate(e.target.value);
                        setErrors((prev) => ({ ...prev, billingStartDate: undefined }));
                    }}
                    error={errors.billingStartDate}
                    disabled={isSaving}
                />
            </Input.Group>

            <BlockFooter isDirty={isDirty} isSaving={isSaving} onSave={handleSave} modifiedAtLabel={modifiedAtLabel} />
        </ConfigBlockShell>
    );
}

interface PixBlockProps {
    configs?: SystemConfig[];
}

function PixBlock({ configs }: PixBlockProps) {
    const { success, error: showError } = useToast();
    const updateMutation = useUpdateSystemConfig();
    const queryClient = useQueryClient();
    const pixQuery = usePixInfo();

    const savedPixKey = findValue(configs, SYSTEM_CONFIG_KEYS.PIX_KEY);
    const savedReceiverName = findValue(configs, SYSTEM_CONFIG_KEYS.PIX_RECEIVER_NAME);
    const savedReceiverCity = findValue(configs, SYSTEM_CONFIG_KEYS.PIX_RECEIVER_CITY);

    const [pixKey, setPixKey] = useState(savedPixKey);
    const [receiverName, setReceiverName] = useState(savedReceiverName);
    const [receiverCity, setReceiverCity] = useState(savedReceiverCity);
    const [errors, setErrors] = useState<{ pixKey?: string; receiverName?: string; receiverCity?: string }>({});

    const dirty = {
        pixKey: pixKey !== savedPixKey,
        receiverName: receiverName !== savedReceiverName,
        receiverCity: receiverCity !== savedReceiverCity,
    };
    const isDirty = dirty.pixKey || dirty.receiverName || dirty.receiverCity;
    const isSaving = updateMutation.isPending;

    const handleSave = async () => {
        const newErrors: typeof errors = {};

        if (!pixKey.trim()) newErrors.pixKey = 'Informe a chave Pix';
        if (!receiverName.trim()) newErrors.receiverName = 'Informe o nome do recebedor';
        if (!receiverCity.trim()) newErrors.receiverCity = 'Informe a cidade do recebedor';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            await Promise.all([
                dirty.pixKey &&
                    updateMutation.mutateAsync({ key: SYSTEM_CONFIG_KEYS.PIX_KEY, value: pixKey.trim() }),
                dirty.receiverName &&
                    updateMutation.mutateAsync({ key: SYSTEM_CONFIG_KEYS.PIX_RECEIVER_NAME, value: receiverName.trim() }),
                dirty.receiverCity &&
                    updateMutation.mutateAsync({ key: SYSTEM_CONFIG_KEYS.PIX_RECEIVER_CITY, value: receiverCity.trim() }),
            ]);
            await queryClient.invalidateQueries({ queryKey: [PIX_INFO_QUERY_KEY] });
            success('Dados do Pix atualizados com sucesso');
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Erro ao atualizar os dados do Pix');
        }
    };

    const handleCopyPayload = async () => {
        const payload = pixQuery.data?.payload;
        if (!payload) return;

        try {
            await navigator.clipboard.writeText(payload);
            success('Código Pix copiado!');
        } catch {
            showError('Não foi possível copiar. Selecione e copie manualmente.');
        }
    };

    const modifiedAtLabel = formatModifiedAt(
        latestModifiedAt(configs, [
            SYSTEM_CONFIG_KEYS.PIX_KEY,
            SYSTEM_CONFIG_KEYS.PIX_RECEIVER_NAME,
            SYSTEM_CONFIG_KEYS.PIX_RECEIVER_CITY,
        ]),
    );

    return (
        <ConfigBlockShell
            title="PIX"
            description="Dados usados para gerar o QR Code e o código copia e cola na página pública de pagamento."
            icon={<PixIcon />}
        >
            <Input.Group>
                <Input.Root
                    label="CHAVE PIX"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={pixKey}
                    onChange={(e) => {
                        setPixKey(e.target.value);
                        setErrors((prev) => ({ ...prev, pixKey: undefined }));
                    }}
                    error={errors.pixKey}
                    disabled={isSaving}
                />

                <div>
                    <Input.Root
                        label="NOME DO RECEBEDOR"
                        placeholder="Ex.: JOAO DA SILVA"
                        maxLength={25}
                        value={receiverName}
                        onChange={(e) => {
                            setReceiverName(e.target.value);
                            setErrors((prev) => ({ ...prev, receiverName: undefined }));
                        }}
                        error={errors.receiverName}
                        disabled={isSaving}
                    />
                    <p className="text-xs text-white/30 body-text mt-2">
                        Máx. 25 caracteres. Acentos e minúsculas são normalizados no QR Code.
                    </p>
                </div>

                <div>
                    <Input.Root
                        label="CIDADE DO RECEBEDOR"
                        placeholder="Ex.: FORTALEZA"
                        maxLength={15}
                        value={receiverCity}
                        onChange={(e) => {
                            setReceiverCity(e.target.value);
                            setErrors((prev) => ({ ...prev, receiverCity: undefined }));
                        }}
                        error={errors.receiverCity}
                        disabled={isSaving}
                    />
                    <p className="text-xs text-white/30 body-text mt-2">
                        Máx. 15 caracteres. Acentos e minúsculas são normalizados no QR Code.
                    </p>
                </div>
            </Input.Group>

            <BlockFooter isDirty={isDirty} isSaving={isSaving} onSave={handleSave} modifiedAtLabel={modifiedAtLabel} />

            <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-xs tech-text text-white/40 tracking-wider">PRÉVIA DO QR CODE</p>

                {pixQuery.isLoading && (
                    <div className="flex items-center gap-3 py-2">
                        <Loading.Root size="md" />
                        <p className="text-sm text-white/50 body-text">Gerando prévia...</p>
                    </div>
                )}

                {pixQuery.isError && (
                    <p className="text-sm text-white/40 body-text">
                        {pixQuery.error instanceof Error
                            ? pixQuery.error.message
                            : 'Configure os dados acima para gerar o QR Code.'}
                    </p>
                )}

                {pixQuery.data && (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="bg-white p-3 chamfer-sm shrink-0">
                            <QRCode value={pixQuery.data.payload} size={140} level="H" />
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            <p className="text-sm text-white/50 body-text">
                                É exatamente isso que os alunos verão na página pública de pagamento.
                            </p>
                            <Button.Root
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleCopyPayload}
                                className="w-full sm:w-auto"
                            >
                                <Button.Text>COPIAR CÓDIGO PIX</Button.Text>
                            </Button.Root>
                        </div>
                    </div>
                )}
            </div>
        </ConfigBlockShell>
    );
}

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

function renderPreview(template: string, vars: Record<string, string>): string {
    return template.replace(VARIABLE_PATTERN, (match, name: string) => vars[name] ?? match);
}

function validateTemplate(template: string): string | undefined {
    if (!template.trim()) return 'Informe o texto da mensagem';

    const known = CHARGE_VARIABLES.map((v) => v.name as string);
    const unknown = [...template.matchAll(VARIABLE_PATTERN)].map((m) => m[1]).filter((name) => !known.includes(name));

    return unknown.length > 0
        ? `Variável desconhecida: ${unknown.map((name) => `{{${name}}}`).join(', ')}`
        : undefined;
}

interface MessageFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled: boolean;
    previewVars: Record<string, string>;
}

function MessageField({ label, value, onChange, error, disabled, previewVars }: MessageFieldProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertVariable = (name: string) => {
        const el = textareaRef.current;
        if (!el) return;

        const token = `{{${name}}}`;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const cursor = start + token.length;

        onChange(value.slice(0, start) + token + value.slice(end));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(cursor, cursor);
        });
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs tech-text text-white/70 tracking-wider">{label}</label>

            <div className="flex flex-wrap gap-2">
                {CHARGE_VARIABLES.map((variable) => (
                    <button
                        key={variable.name}
                        type="button"
                        title={variable.description}
                        disabled={disabled}
                        onClick={() => insertVariable(variable.name)}
                        className="px-2 py-1 text-xs tech-text border border-white/30 text-white/70 hover:bg-white hover:text-black hover:border-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {`{{${variable.name}}}`}
                    </button>
                ))}
            </div>

            <textarea
                ref={textareaRef}
                rows={9}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full px-4 py-3 bg-transparent border-2 ${error ? 'border-red-500' : 'border-white/30'} text-white body-text placeholder:text-white/40 focus:outline-none focus:border-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-y`}
            />
            {error && <p className="text-xs text-red-500 body-text">{error}</p>}

            <div className="border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs tech-text text-white/40 tracking-wider">PRÉVIA (DADOS DE EXEMPLO)</p>
                <p className="text-sm text-white/70 body-text whitespace-pre-wrap break-words">
                    {renderPreview(value, previewVars)}
                </p>
            </div>
        </div>
    );
}

interface ChargeBlockProps {
    configs?: SystemConfig[];
}

function ChargeBlock({ configs }: ChargeBlockProps) {
    const { success, error: showError } = useToast();
    const updateMutation = useUpdateSystemConfig();

    const saved = {
        day: findValue(configs, SYSTEM_CONFIG_KEYS.CHARGE_DAY),
        time: findValue(configs, SYSTEM_CONFIG_KEYS.CHARGE_TIME),
        messageOk: findValue(configs, SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_OK),
        messagePending: findValue(configs, SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_PENDING),
    };

    const [day, setDay] = useState(saved.day);
    const [time, setTime] = useState(saved.time);
    const [messageOk, setMessageOk] = useState(saved.messageOk);
    const [messagePending, setMessagePending] = useState(saved.messagePending);
    const [errors, setErrors] = useState<{ day?: string; time?: string; messageOk?: string; messagePending?: string }>({});

    const dirty = {
        day: day.trim() !== saved.day,
        time: time !== saved.time,
        messageOk: messageOk.trim() !== saved.messageOk,
        messagePending: messagePending.trim() !== saved.messagePending,
    };
    const isDirty = Object.values(dirty).some(Boolean);
    const isSaving = updateMutation.isPending;

    const monthlyFee = Number(findValue(configs, SYSTEM_CONFIG_KEYS.MONTHLY_FEE));
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });
    const previewVars = {
        nome: 'Maria',
        mes: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
        valor_atraso: '50,00',
        mensalidade: (Number.isNaN(monthlyFee) ? 0 : monthlyFee).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }),
    };

    const handleSave = async () => {
        const newErrors: typeof errors = {};

        const parsedDay = Number(day);
        if (!day.trim() || !Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 28) {
            newErrors.day = 'Informe um dia de 1 a 28';
        }
        if (!time) newErrors.time = 'Informe o horário';
        newErrors.messageOk = validateTemplate(messageOk);
        newErrors.messagePending = validateTemplate(messagePending);

        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        const updates: UpdateConfigRequest[] = [];
        if (dirty.day) updates.push({ key: SYSTEM_CONFIG_KEYS.CHARGE_DAY, value: String(parsedDay) });
        if (dirty.time) updates.push({ key: SYSTEM_CONFIG_KEYS.CHARGE_TIME, value: time });
        if (dirty.messageOk) updates.push({ key: SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_OK, value: messageOk.trim() });
        if (dirty.messagePending) {
            updates.push({ key: SYSTEM_CONFIG_KEYS.CHARGE_MESSAGE_PENDING, value: messagePending.trim() });
        }

        try {
            for (const update of updates) {
                await updateMutation.mutateAsync(update);
            }
            success('Configurações de cobrança atualizadas com sucesso');
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Erro ao atualizar as configurações de cobrança');
        }
    };

    const modifiedAtLabel = formatModifiedAt(latestModifiedAt(configs, CHARGE_KEYS));

    return (
        <ConfigBlockShell
            title="MENSAGEM DE COBRANÇA"
            description="Quando o lembrete automático é enviado por WhatsApp e o texto que cada aluno recebe."
            icon={<MessageIcon />}
        >
            <Input.Group>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input.Root
                        label="DIA DO MÊS (1 A 28)"
                        type="number"
                        min="1"
                        max="28"
                        step="1"
                        value={day}
                        onChange={(e) => {
                            setDay(e.target.value);
                            setErrors((prev) => ({ ...prev, day: undefined }));
                        }}
                        error={errors.day}
                        disabled={isSaving}
                    />

                    <Input.Root
                        label="HORÁRIO"
                        type="time"
                        value={time}
                        onChange={(e) => {
                            setTime(e.target.value);
                            setErrors((prev) => ({ ...prev, time: undefined }));
                        }}
                        error={errors.time}
                        disabled={isSaving}
                    />
                </div>
                <p className="text-xs text-white/30 body-text -mt-3">
                    Horário de Fortaleza (UTC-3). Alterações valem já para o próximo envio.
                </p>

                <MessageField
                    label="MENSAGEM PARA QUEM ESTÁ EM DIA"
                    value={messageOk}
                    onChange={(value) => {
                        setMessageOk(value);
                        setErrors((prev) => ({ ...prev, messageOk: undefined }));
                    }}
                    error={errors.messageOk}
                    disabled={isSaving}
                    previewVars={previewVars}
                />

                <MessageField
                    label="MENSAGEM PARA QUEM ESTÁ PENDENTE"
                    value={messagePending}
                    onChange={(value) => {
                        setMessagePending(value);
                        setErrors((prev) => ({ ...prev, messagePending: undefined }));
                    }}
                    error={errors.messagePending}
                    disabled={isSaving}
                    previewVars={previewVars}
                />
            </Input.Group>

            <BlockFooter isDirty={isDirty} isSaving={isSaving} onSave={handleSave} modifiedAtLabel={modifiedAtLabel} />
        </ConfigBlockShell>
    );
}

export default function SettingsPage() {
    const { data: configs, isLoading, isError } = useSystemConfig();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6">
                    <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                        CONFIGURAÇÕES
                    </h1>
                    <p className="text-sm tech-text text-white/50 tracking-wider">
                        PERSONALIZE O COMPORTAMENTO DO BOT
                    </p>
                </div>

                {isLoading ? (
                    <SettingsSkeleton />
                ) : isError ? (
                    <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center">
                        <p className="text-white body-text">
                            Não foi possível carregar as configurações.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div className="space-y-6">
                            <MonthlyFeeBlock
                                key={`monthly-fee-${latestModifiedAt(configs, [SYSTEM_CONFIG_KEYS.MONTHLY_FEE, SYSTEM_CONFIG_KEYS.BILLING_START_DATE]) ?? 'new'}`}
                                configs={configs}
                            />
                            <PixBlock
                                key={`pix-${latestModifiedAt(configs, [SYSTEM_CONFIG_KEYS.PIX_KEY, SYSTEM_CONFIG_KEYS.PIX_RECEIVER_NAME, SYSTEM_CONFIG_KEYS.PIX_RECEIVER_CITY]) ?? 'new'}`}
                                configs={configs}
                            />
                        </div>
                        <ChargeBlock
                            key={`charge-${latestModifiedAt(configs, CHARGE_KEYS) ?? 'new'}`}
                            configs={configs}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
