'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';
import type { Student } from '@/types/student';

interface StudentFormModalProps {
    open: boolean;
    onClose: () => void;
    student?: Student;
}

interface FormState {
    name: string;
    matricula: string;
    phone: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const MATRICULA_PATTERN = /^[0-9]+$/;

export function StudentFormModal({ open, onClose, student }: StudentFormModalProps) {
    const isEditMode = !!student;

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
                    {/* key força remontagem (e reset do form) ao trocar de aluno ou reabrir em modo criação */}
                    <StudentFormFields
                        key={student?.id ?? 'new'}
                        isEditMode={isEditMode}
                        studentId={student?.id}
                        initial={{
                            name: student?.name ?? '',
                            matricula: student?.matricula ?? '',
                            phone: student?.phone ?? '',
                        }}
                        onDone={onClose}
                        onCancel={onClose}
                    />
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

        if (!formData.matricula.trim()) {
            newErrors.matricula = 'Matrícula é obrigatória';
        } else if (!MATRICULA_PATTERN.test(formData.matricula.trim())) {
            newErrors.matricula = 'Matrícula deve conter apenas números';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefone é obrigatório';
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

        const payload = {
            name: formData.name.trim(),
            matricula: formData.matricula.trim(),
            phone: formData.phone.trim(),
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
                    label="MATRÍCULA"
                    placeholder="Apenas números"
                    inputMode="numeric"
                    value={formData.matricula}
                    onChange={handleChange('matricula')}
                    error={errors.matricula}
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
