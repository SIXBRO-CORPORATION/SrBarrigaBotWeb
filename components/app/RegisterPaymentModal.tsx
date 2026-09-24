'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileInput } from '@/components/ui/FileInput';
import { useRegisterPayment } from '@/hooks/usePayments';

interface RegisterPaymentModalProps {
    open: boolean;
    onClose: () => void;
    studentId: string;
}

interface FormState {
    amount: string;
    paidAt: string;
    note: string;
}

type FormErrors = Partial<Record<'amount' | 'paidAt', string>>;

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: FormState = {
    amount: '',
    paidAt: todayIsoDate(),
    note: '',
};

export function RegisterPaymentModal({ open, onClose, studentId }: RegisterPaymentModalProps) {
    return (
        <Modal.Root open={open} onClose={onClose} size="md">
            <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-white">
                            REGISTRAR PAGAMENTO
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                            aria-label="Fechar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="relative p-6">
                    {/* key remonta o form (reset completo) toda vez que o modal reabre */}
                    <RegisterPaymentFields
                        key={open ? 'open' : 'closed'}
                        studentId={studentId}
                        onDone={onClose}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </Modal.Root>
    );
}

interface RegisterPaymentFieldsProps {
    studentId: string;
    onDone: () => void;
    onCancel: () => void;
}

function RegisterPaymentFields({ studentId, onDone, onCancel }: RegisterPaymentFieldsProps) {
    const registerMutation = useRegisterPayment(studentId);

    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = () => {
        const newErrors: FormErrors = {};

        const amountValue = Number(formData.amount.replace(',', '.'));
        if (!formData.amount.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
            newErrors.amount = 'Valor deve ser um número maior que zero';
        }

        if (!formData.paidAt) {
            newErrors.paidAt = 'Data do payment é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (field === 'amount' || field === 'paidAt') {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await registerMutation.mutateAsync({
                amount: Number(formData.amount.replace(',', '.')),
                paidAt: formData.paidAt,
                note: formData.note.trim() || undefined,
                comprovante: comprovante ?? undefined,
            });
            onDone();
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao registrar payment');
        }
    };

    const isSubmitting = registerMutation.isPending;

    return (
        <form onSubmit={handleSubmit}>
            <Input.Group>
                <Input.Root
                    label="VALOR (R$)"
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
                    label="DATA DO PAGAMENTO"
                    type="date"
                    value={formData.paidAt}
                    onChange={handleChange('paidAt')}
                    error={errors.paidAt}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="NOTA (OPCIONAL)"
                    placeholder="Ex.: pagamento via Pix"
                    value={formData.note}
                    onChange={handleChange('note')}
                    disabled={isSubmitting}
                />

                <FileInput.Root
                    label="COMPROVANTE (OPCIONAL)"
                    value={comprovante}
                    onChange={setComprovante}
                    disabled={isSubmitting}
                    captureEnvironment
                />
            </Input.Group>

            <div className="flex gap-3 mt-8">
                <Button.Root
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    <Button.Text>CANCELAR</Button.Text>
                </Button.Root>
                <Button.Root
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    <Button.Text>{isSubmitting ? 'ENVIANDO...' : 'REGISTRAR'}</Button.Text>
                </Button.Root>
            </div>
        </form>
    );
}
