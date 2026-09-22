'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'CONFIRMAR',
    cancelLabel = 'CANCELAR',
    loading = false,
    variant = 'danger',
}: ConfirmDialogProps) {
    const accentBorder = variant === 'danger' ? 'border-red-500' : 'border-white';
    const accentBorderSoft = variant === 'danger' ? 'border-red-500/20' : 'border-white/20';
    const iconColor = variant === 'danger' ? 'text-red-500' : 'text-white';

    return (
        <Modal.Root open={open} onClose={onClose} size="sm">
            <div className={`bg-[#0A0A0A] border-2 ${accentBorder} chamfer overflow-hidden`}>
                <div className={`absolute inset-3 border ${accentBorderSoft} chamfer-sm pointer-events-none`} />

                <div className={`relative p-6 border-b-2 ${accentBorderSoft}`}>
                    <h2 className="text-xl text-white">
                        {title}
                    </h2>
                </div>

                <div className="relative p-6">
                    <div className="flex items-start gap-3 mb-6">
                        <svg className={`w-6 h-6 ${iconColor} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-white body-text mb-2">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button.Root
                            variant="ghost"
                            size="md"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            <Button.Text>{cancelLabel}</Button.Text>
                        </Button.Root>
                        <Button.Root
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            size="md"
                            onClick={onConfirm}
                            loading={loading}
                            disabled={loading}
                            className="flex-1"
                        >
                            <Button.Text>{confirmLabel}</Button.Text>
                        </Button.Root>
                    </div>
                </div>
            </div>
        </Modal.Root>
    );
}
