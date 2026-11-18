'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries';
import type { Entry, EntryType } from '@/types/entry';

interface EntryFormModalProps {
    open: boolean;
    onClose: () => void;
    entry?: Entry;
}

interface FormState {
    type: EntryType;
    title: string;
    details: string;
    amount: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/;

export function EntryFormModal({ open, onClose, entry }: EntryFormModalProps) {
    const isEditMode = !!entry;

    return (
        <Modal.Root open={open} onClose={onClose} size="md">
            <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-white">
                            {isEditMode ? 'EDITAR LANÇAMENTO' : 'NOVO LANÇAMENTO'}
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
                    {/* key força remontagem (e reset do form) ao trocar de lançamento */}
                    <EntryFormFields
                        key={entry?.id ?? 'new'}
                        entryId={entry?.id}
                        initial={{
                            type: entry?.type ?? 'LUCRO',
                            title: entry?.title ?? '',
                            details: entry?.details ?? '',
                            amount: entry ? String(entry.amount).replace('.', ',') : '',
                        }}
                        onDone={onClose}
                    />
                </div>
            </div>
        </Modal.Root>
    );
}

function EntryFormFields({ entryId, initial, onDone }: { entryId?: string; initial: FormState; onDone: () => void }) {
    const createMutation = useCreateEntry();
    const updateMutation = useUpdateEntry();

    const [formData, setFormData] = useState<FormState>(initial);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState('');

    const amountText = formData.amount.trim();
    const parsedAmount = Number(amountText.replace(',', '.'));

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';

        if (!AMOUNT_PATTERN.test(amountText)) {
            newErrors.amount = 'Informe um número com até 2 casas decimais';
        } else if (parsedAmount <= 0) {
            newErrors.amount = 'Valor deve ser maior que zero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            type: formData.type,
            title: formData.title.trim(),
            details: formData.details.trim(),
            amount: parsedAmount,
        };

        setSubmitError('');
        try {
            if (entryId) {
                await updateMutation.mutateAsync({ id: entryId, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onDone();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Erro ao salvar lançamento');
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit}>
            <Input.Group>
                <div>
                    <p className="block text-xs tech-text text-white/70 mb-2 tracking-wider">TIPO</p>
                    <div className="grid grid-cols-2 gap-3">
                        {(['LUCRO', 'GASTO'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                disabled={isSubmitting}
                                aria-pressed={formData.type === t}
                                onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                                className={`px-4 py-3 border-2 tech-text text-sm transition-colors ${
                                    formData.type === t
                                        ? t === 'LUCRO'
                                            ? 'border-green-500 bg-green-500/10 text-green-500'
                                            : 'border-red-500 bg-red-500/10 text-red-500'
                                        : 'border-white/30 text-white/60 hover:border-white'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <Input.Root
                    label="TÍTULO"
                    placeholder="Ex.: Rifa, Camisetas"
                    value={formData.title}
                    onChange={handleChange('title')}
                    error={errors.title}
                    disabled={isSubmitting}
                />

                <div className="w-full">
                    <label htmlFor="entry-details" className="block text-xs tech-text text-white/70 mb-2 tracking-wider">
                        DETALHES (OPCIONAL)
                    </label>
                    <textarea
                        id="entry-details"
                        rows={3}
                        placeholder="Descreva o lançamento"
                        value={formData.details}
                        onChange={handleChange('details')}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white body-text placeholder:text-white/40 focus:outline-none focus:border-white transition-all duration-200 disabled:opacity-50 resize-none"
                    />
                </div>

                <Input.Root
                    label="VALOR (R$)"
                    placeholder="0,00"
                    inputMode="decimal"
                    value={formData.amount}
                    onChange={handleChange('amount')}
                    error={errors.amount}
                    disabled={isSubmitting}
                />
            </Input.Group>

            {submitError && <p className="mt-4 text-xs text-red-500 body-text">{submitError}</p>}

            <div className="flex gap-3 mt-8">
                <Button.Root type="button" variant="ghost" size="md" onClick={onDone} disabled={isSubmitting} className="flex-1">
                    <Button.Text>CANCELAR</Button.Text>
                </Button.Root>
                <Button.Root type="submit" variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting} className="flex-1">
                    <Button.Text>{entryId ? 'SALVAR' : 'CRIAR'}</Button.Text>
                </Button.Root>
            </div>
        </form>
    );
}
