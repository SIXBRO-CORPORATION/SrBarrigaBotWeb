'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { useStudentDetail, useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';
import type { CreateStudentRequest } from '@/types/student';

interface StudentFormModalProps {
    open: boolean;
    onClose: () => void;
    /** Quando presente, o modal abre em modo de edição e carrega os dados do aluno. */
    studentId?: string;
}

interface FormState {
    name: string;
    phone: string;
    monthlyFee: string;
    startDate: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export function StudentFormModal({ open, onClose, studentId }: StudentFormModalProps) {
    const isEditMode = !!studentId;
    const { data: studentDetail, isLoading: isLoadingDetail } = useStudentDetail(studentId ?? '');

    const isBusyLoadingDetail = isEditMode && isLoadingDetail;

    return (
        <Modal.Root open={open} onClose={onClose} size="md">
            <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-white">
                            {isEditMode ? 'EDITAR ALUNO' : 'NOVO ALUNO'}
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
                    {isBusyLoadingDetail ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loading.Root size="lg" />
                            <p className="text-white/70 body-text text-center">
                                Carregando dados do aluno...
                            </p>
                        </div>
                    ) : (
                        <StudentFormFields
                            key={studentId ?? 'new'}
                            isEditMode={isEditMode}
                            studentId={studentId}
                            initial={{
                                name: studentDetail?.name ?? '',
                                phone: studentDetail?.phone ?? '',
                                monthlyFee: studentDetail ? String(studentDetail.monthlyFee) : '',
                                startDate: studentDetail ? studentDetail.startDate.slice(0, 10) : '',
                            }}
                            onDone={onClose}
                            onCancel={onClose}
                        />
                    )}
                </div>
            </div>
        </Modal.Root>
    );
}

interface StudentFormFieldsProps {
    isEditMode: boolean;
    studentId?: string;
    initial: FormState;
    onDone: () => void;
    onCancel: () => void;
}

function StudentFormFields({ isEditMode, studentId, initial, onDone, onCancel }: StudentFormFieldsProps) {
    const createMutation = useCreateStudent();
    const updateMutation = useUpdateStudent();

    const [formData, setFormData] = useState<FormState>(initial);
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefone é obrigatório';
        }

        const feeValue = Number(formData.monthlyFee.replace(',', '.'));
        if (!formData.monthlyFee.trim() || Number.isNaN(feeValue) || feeValue <= 0) {
            newErrors.monthlyFee = 'Mensalidade deve ser um valor válido';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Data de início é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: CreateStudentRequest = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            monthlyFee: Number(formData.monthlyFee.replace(',', '.')),
            startDate: formData.startDate,
        };

        try {
            if (isEditMode && studentId) {
                await updateMutation.mutateAsync({ id: studentId, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onDone();
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao salvar aluno');
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit}>
            <Input.Group>
                <Input.Root
                    label="NOME"
                    placeholder="Nome do aluno"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="TELEFONE"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    error={errors.phone}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="MENSALIDADE (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.monthlyFee}
                    onChange={handleChange('monthlyFee')}
                    error={errors.monthlyFee}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="DATA DE INÍCIO"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange('startDate')}
                    error={errors.startDate}
                    disabled={isSubmitting}
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
                    <Button.Text>{isEditMode ? 'SALVAR' : 'CRIAR'}</Button.Text>
                </Button.Root>
            </div>
        </form>
    );
}
