'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/app/Layout';
import { Table } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { PaymentsSkeleton } from '@/components/app/PaymentsSkeleton';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { RejectPaymentModal } from '@/components/app/RejectPaymentModal';
import { ReceiptPreview } from '@/components/app/ReceiptPreview';
import { usePendingPayments, useApprovePayment, useRejectPayment } from '@/hooks/usePayments';
import type { Payment } from '@/types/payment';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString('pt-BR');
}

export default function PendingPaymentsPage() {
    const {
        data: payments,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = usePendingPayments();
    const approveMutation = useApprovePayment();
    const rejectMutation = useRejectPayment();

    const [approvingPayment, setApprovingPayment] = useState<Payment | null>(null);
    const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
    const [previewPaymentId, setPreviewPaymentId] = useState<string | null>(null);
    const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);

    // Derivado do cache: quando a query é refeita, a preview passa a usar a signed URL nova.
    const previewPayment = payments?.find((payment) => payment.id === previewPaymentId) ?? null;

    // A signed URL do comprovante expira, então a lista é refeita antes de abrir a preview
    // para garantir um link válido mesmo com a tela aberta há muito tempo.
    const handleOpenReceipt = async (payment: Payment) => {
        setOpeningReceiptId(payment.id);
        try {
            const result = await refetch();
            if (result.isError) return;

            const fresh = result.data?.find((item) => item.id === payment.id);
            if (fresh?.receiptUrl) {
                setPreviewPaymentId(fresh.id);
            }
        } finally {
            setOpeningReceiptId(null);
        }
    };

    const handleConfirmApprove = async () => {
        if (!approvingPayment) return;

        try {
            await approveMutation.mutateAsync(approvingPayment.id);
            setApprovingPayment(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao aprovar pagamento');
        }
    };

    const handleConfirmReject = async (reason?: string) => {
        if (!rejectingPayment) return;

        try {
            await rejectMutation.mutateAsync({ paymentId: rejectingPayment.id, reason });
            setRejectingPayment(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao recusar pagamento');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6">
                    <h1 className="text-3xl lg:text-4xl text-white">
                        PAGAMENTOS PENDENTES
                    </h1>
                    <p className="text-sm tech-text text-white/50 tracking-wider mt-2">
                        {payments && payments.length > 0
                            ? `${payments.length} ${payments.length === 1 ? 'PAGAMENTO AGUARDANDO' : 'PAGAMENTOS AGUARDANDO'} APROVAÇÃO`
                            : 'REVISE OS COMPROVANTES ENVIADOS PELOS ALUNOS'}
                    </p>
                </div>

                {isLoading ? (
                    <PaymentsSkeleton />
                ) : isError ? (
                    <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center">
                        <p className="text-white body-text">
                            Não foi possível carregar os pagamentos pendentes.
                        </p>
                    </div>
                ) : !payments || payments.length === 0 ? (
                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-12 text-center space-y-3">
                        <p className="text-white body-text text-lg">
                            Nenhum pagamento pendente
                        </p>
                        <p className="text-sm text-white/50 body-text">
                            Assim que um aluno registrar um pagamento, ele aparecerá aqui para aprovação
                        </p>
                    </div>
                ) : (
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Cell as="th">Aluno</Table.Cell>
                                <Table.Cell as="th">Data do pagamento</Table.Cell>
                                <Table.Cell as="th">Valor</Table.Cell>
                                <Table.Cell as="th">Nota</Table.Cell>
                                <Table.Cell as="th">Comprovante</Table.Cell>
                                <Table.Cell as="th">Enviado em</Table.Cell>
                                <Table.Cell as="th">Ações</Table.Cell>
                            </Table.Row>
                        </Table.Header>
                        <tbody>
                            {payments.map((payment) => (
                                <Table.Row key={payment.id}>
                                    <Table.Cell>
                                        {payment.studentId ? (
                                            <Link
                                                href={`/students/${payment.studentId}`}
                                                className="text-white hover:underline"
                                            >
                                                {payment.studentName || 'Aluno'}
                                            </Link>
                                        ) : (
                                            <span className="text-white/70">{payment.studentName || '—'}</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{formatDate(payment.paidAt)}</Table.Cell>
                                    <Table.Cell>{formatCurrency(payment.amount)}</Table.Cell>
                                    <Table.Cell>
                                        <span className="text-white/70">{payment.note || '—'}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {payment.receiptUrl ? (
                                            <button
                                                onClick={() => handleOpenReceipt(payment)}
                                                disabled={openingReceiptId === payment.id}
                                                className="inline-flex items-center gap-1 text-white/70 hover:text-white hover:underline disabled:opacity-50 disabled:cursor-wait"
                                                aria-label={`Ver comprovante do pagamento de ${formatCurrency(payment.amount)}`}
                                            >
                                                {openingReceiptId === payment.id ? (
                                                    <Loading.Root size="sm" />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                                VER
                                            </button>
                                        ) : (
                                            <span className="text-white/30">—</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-white/50 text-xs">{formatDateTime(payment.createdAt)}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setApprovingPayment(payment)}
                                                className="p-2 border border-green-500/50 text-green-500/80 hover:text-green-500 hover:border-green-500 transition-colors"
                                                aria-label={`Aprovar pagamento de ${formatCurrency(payment.amount)}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setRejectingPayment(payment)}
                                                className="p-2 border border-red-500/50 text-red-500/80 hover:text-red-500 hover:border-red-500 transition-colors"
                                                aria-label={`Recusar pagamento de ${formatCurrency(payment.amount)}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </tbody>
                    </Table.Root>
                )}
            </div>

            <ReceiptPreview
                open={!!previewPayment?.receiptUrl}
                onClose={() => setPreviewPaymentId(null)}
                receiptUrl={previewPayment?.receiptUrl ?? null}
                subtitle={
                    previewPayment
                        ? `${previewPayment.studentName || 'Aluno'} · ${formatCurrency(previewPayment.amount)} · ${formatDate(previewPayment.paidAt)}`
                        : undefined
                }
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
            />

            <ConfirmDialog
                open={!!approvingPayment}
                onClose={() => setApprovingPayment(null)}
                onConfirm={handleConfirmApprove}
                title="APROVAR PAGAMENTO"
                description={`Confirmar aprovação do pagamento de ${approvingPayment ? formatCurrency(approvingPayment.amount) : ''}${approvingPayment?.studentName ? ` de ${approvingPayment.studentName}` : ''}?`}
                confirmLabel="APROVAR"
                loading={approveMutation.isPending}
                variant="primary"
            />

            <RejectPaymentModal
                key={rejectingPayment?.id ?? 'reject-modal'}
                open={!!rejectingPayment}
                onClose={() => setRejectingPayment(null)}
                onConfirm={handleConfirmReject}
                loading={rejectMutation.isPending}
            />
        </DashboardLayout>
    );
}
