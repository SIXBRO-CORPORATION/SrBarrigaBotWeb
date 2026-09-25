'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface RejectPaymentModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
    loading?: boolean;
}

export function RejectPaymentModal({ open, onClose, onConfirm, loading = false }: RejectPaymentModalProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason.trim() || undefined);
    };

    return (
        <Modal.Root open={open} onClose={onClose} size="sm">
            <div className="relative bg-[#0A0A0A] border-2 border-red-500 chamfer overflow-hidden">
                <div className="absolute inset-3 border border-red-500/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-red-500/20">
                    <h2 className="text-xl text-white">
                        RECUSAR PAGAMENTO
                    </h2>
                </div>

                <div className="relative p-6">
                    <div className="flex items-start gap-3 mb-6">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-white body-text">
                            Tem certeza que deseja recusar este pagamento? Essa ação não poderá ser desfeita.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="reject-reason" className="block text-xs tech-text text-white/70 mb-2 tracking-wider">
                            MOTIVO (OPCIONAL)
                        </label>
                        <textarea
                            id="reject-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            rows={3}
                            placeholder="Ex.: comprovante ilegível, valor divergente..."
                            className="
                                w-full px-4 py-3 resize-none
                                bg-transparent
                                border-b-2 border-white/30
                                text-white body-text
                                placeholder:text-white/40 placeholder:font-normal
                                focus:outline-none focus:border-white
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button.Root
                            variant="ghost"
                            size="md"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            <Button.Text>CANCELAR</Button.Text>
                        </Button.Root>
                        <Button.Root
                            variant="danger"
                            size="md"
                            onClick={handleConfirm}
                            loading={loading}
                            disabled={loading}
                            className="flex-1"
                        >
                            <Button.Text>RECUSAR</Button.Text>
                        </Button.Root>
                    </div>
                </div>
            </div>
        </Modal.Root>
    );
}
