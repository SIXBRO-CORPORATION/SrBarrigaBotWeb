'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileInput } from '@/components/ui/FileInput';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/providers/ToastProvider';
import { usePixInfo, useRegisterPublicPayment } from '@/hooks/usePublicPayment';
import type { PublicPaymentResult } from '@/types/public-payment';

interface FormState {
    matricula: string;
    amount: string;
    note: string;
}

type FormErrors = Partial<Record<'matricula' | 'amount' | 'comprovante', string>>;

const EMPTY_FORM: FormState = {
    matricula: '',
    amount: '',
    note: '',
};

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PagamentoPage() {
    const pixQuery = usePixInfo();
    const registerMutation = useRegisterPublicPayment();
    const { success: showSuccess, error: showErrorToast } = useToast();

    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [result, setResult] = useState<PublicPaymentResult | null>(null);

    const isSubmitting = registerMutation.isPending;

    const handleCopyPix = async () => {
        const payload = pixQuery.data?.payload;
        if (!payload) return;

        try {
            await navigator.clipboard.writeText(payload);
            showSuccess('Código Pix copiado!');
        } catch {
            showErrorToast('Não foi possível copiar. Selecione e copie manualmente.');
        }
    };

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.matricula.trim()) {
            newErrors.matricula = 'Informe sua matrícula';
        }

        const amountValue = Number(formData.amount.replace(',', '.'));
        if (!formData.amount.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
            newErrors.amount = 'Informe o valor que você pagou (maior que zero)';
        }

        if (!comprovante) {
            newErrors.comprovante = 'Anexe o comprovante do Pix';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (field === 'matricula' || field === 'amount') {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleComprovanteChange = (file: File | null) => {
        setComprovante(file);
        setErrors((prev) => ({ ...prev, comprovante: undefined }));
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setComprovante(null);
        setErrors({});
        setResult(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !comprovante) return;

        try {
            const saved = await registerMutation.mutateAsync({
                matricula: formData.matricula.trim(),
                amount: Number(formData.amount.replace(',', '.')),
                note: formData.note.trim() || undefined,
                comprovante,
            });
            setResult(saved);
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (message.toLowerCase().includes('matrícula') || message.toLowerCase().includes('matricula')) {
                setErrors((prev) => ({ ...prev, matricula: message }));
            }
            console.log(message || 'Erro ao registrar payment');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] bg-pattern p-4 py-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-32 bg-white transform -rotate-45 origin-top-left opacity-50" />
            <div className="absolute top-0 left-4 w-1 h-24 bg-white transform -rotate-45 origin-top-left opacity-30" />
            <div className="absolute bottom-0 right-0 w-1 h-32 bg-white transform -rotate-45 origin-bottom-right opacity-50" />
            <div className="absolute bottom-0 right-4 w-1 h-24 bg-white transform -rotate-45 origin-bottom-right opacity-30" />

            <div className="relative w-full max-w-lg mx-auto z-10 space-y-6">
                <div className="text-center mb-2">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 blur-xl" />
                            <div className="relative w-16 h-16 bg-white flex items-center justify-center chamfer">
                                <div className="w-12 h-12 bg-[#0A0A0A] flex items-center justify-center chamfer-sm">
                                    <img alt="Logo Computaria" src="/logo.png" className="w-16 h-12" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-2xl mb-2 text-white text-glow">
                        REGISTRAR PAGAMENTO
                    </h1>
                    <p className="text-xs body-text text-white/40 tracking-wide">
                        Pague via Pix e envie o comprovante para aprovação
                    </p>
                </div>

                {/* Card Pix */}
                <div className="relative bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                    <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />
                    <div className="relative p-6">
                        <h2 className="text-sm tech-text text-white/70 tracking-wider mb-4">
                            1. PAGUE COM PIX
                        </h2>

                        {pixQuery.isLoading && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <Loading.Root size="lg" />
                                <p className="text-white/60 body-text text-sm">Carregando dados do Pix...</p>
                            </div>
                        )}

                        {pixQuery.isError && (
                            <p className="text-sm text-red-500 body-text">
                                {pixQuery.error instanceof Error
                                    ? pixQuery.error.message
                                    : 'Não foi possível carregar a chave Pix. Tente novamente mais tarde.'}
                            </p>
                        )}

                        {pixQuery.data && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-white p-4 chamfer-sm">
                                    <QRCode value={pixQuery.data.payload} size={200} level="H" />
                                </div>

                                <p className="text-xs text-white/50 body-text text-center">
                                    Escaneie o QR Code no app do seu banco e pague o valor que desejar
                                </p>

                                <div className="w-full bg-white/5 border border-white/20 p-3 space-y-2">
                                    <p className="text-xs tech-text text-white/50 tracking-wider">
                                        CHAVE PIX ({pixQuery.data.receiverName})
                                    </p>
                                    <p className="text-sm text-white body-text break-all">
                                        {pixQuery.data.pixKey}
                                    </p>
                                </div>

                                <Button.Root
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={handleCopyPix}
                                    className="w-full"
                                >
                                    <Button.Icon>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </Button.Icon>
                                    <Button.Text>PIX COPIA E COLA</Button.Text>
                                </Button.Root>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Formulário / Sucesso */}
                <div className="relative bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                    <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />
                    <div className="relative p-6">
                        {result ? (
                            <div className="flex flex-col items-center text-center gap-4 py-4">
                                <div className="w-14 h-14 bg-white flex items-center justify-center chamfer-sm">
                                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-lg text-white">PAGAMENTO ENVIADO</h2>
                                <p className="text-sm text-white/60 body-text">
                                    Recebemos o registro de {formatCurrency(result.amount)}. Assim que
                                    conferirmos o comprovante, ele será aprovado.
                                </p>
                                <Button.Root
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={resetForm}
                                    className="mt-2"
                                >
                                    <Button.Text>REGISTRAR OUTRO PAGAMENTO</Button.Text>
                                </Button.Root>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-sm tech-text text-white/70 tracking-wider mb-4">
                                    2. INFORME OS DADOS DO PAGAMENTO
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <Input.Group>
                                        <Input.Root
                                            label="MATRÍCULA"
                                            placeholder="Digite sua matrícula"
                                            value={formData.matricula}
                                            onChange={handleChange('matricula')}
                                            error={errors.matricula}
                                            disabled={isSubmitting}
                                        />

                                        <Input.Root
                                            label="VALOR PAGO (R$)"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0,00"
                                            value={formData.amount}
                                            onChange={handleChange('amount')}
                                            error={errors.amount}
                                            disabled={isSubmitting}
                                        />

                                        <Input.Root
                                            label="OBSERVAÇÃO (OPCIONAL)"
                                            placeholder="Ex.: referente à mensalidade de junho"
                                            value={formData.note}
                                            onChange={handleChange('note')}
                                            disabled={isSubmitting}
                                        />

                                        <FileInput.Root
                                            label="COMPROVANTE DO PIX"
                                            value={comprovante}
                                            onChange={handleComprovanteChange}
                                            error={errors.comprovante}
                                            disabled={isSubmitting}
                                            captureEnvironment
                                            placeholder="Clique ou arraste o comprovante (obrigatório)"
                                        />
                                    </Input.Group>

                                    <Button.Root
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-full mt-8"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        <Button.Text>{isSubmitting ? 'ENVIANDO...' : 'ENVIAR PAGAMENTO'}</Button.Text>
                                    </Button.Root>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-xs body-text text-white/20 text-center">
                    &gt;_compilando vitórias
                </p>
            </div>
        </div>
    );
}
