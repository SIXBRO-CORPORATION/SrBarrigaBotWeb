'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateUser, useUpdateUser } from '@/hooks/useUser';
import type { User } from '@/types/user';

interface UserFormModalProps {
    open: boolean;
    onClose: () => void;
    user?: User;
}

interface FormState {
    name: string;
    email: string;
    password: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
    const isEditMode = !!user;

    return (
        <Modal.Root open={open} onClose={onClose} size="md">
            <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-white">
                            {isEditMode ? 'EDITAR MEMBRO' : 'NOVO MEMBRO'}
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
                    <UserFormFields
                        key={user?.id ?? 'new'}
                        isEditMode={isEditMode}
                        userId={user?.id}
                        initial={{
                            name: user?.name ?? '',
                            email: user?.email ?? '',
                            password: '',
                        }}
                        onDone={onClose}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </Modal.Root>
    );
}

interface UserFormFieldsProps {
    isEditMode: boolean;
    userId?: string;
    initial: FormState;
    onDone: () => void;
    onCancel: () => void;
}

function UserFormFields({ isEditMode, userId, initial, onDone, onCancel }: UserFormFieldsProps) {
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();

    const [formData, setFormData] = useState<FormState>(initial);
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
            newErrors.email = 'E-mail inválido';
        }

        const password = formData.password.trim();
        if (!isEditMode && password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        } else if (isEditMode && password.length > 0 && password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
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

        const password = formData.password.trim();

        try {
            if (isEditMode && userId) {
                await updateMutation.mutateAsync({
                    id: userId,
                    data: {
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        ...(password ? { password } : {}),
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password,
                });
            }
            onDone();
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao salvar usuário');
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit}>
            <Input.Group>
                <Input.Root
                    label="NOME"
                    placeholder="Nome do membro"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="E-MAIL"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={errors.email}
                    disabled={isSubmitting}
                />

                <Input.Root
                    label="SENHA"
                    type="password"
                    placeholder={isEditMode ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    error={errors.password}
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
