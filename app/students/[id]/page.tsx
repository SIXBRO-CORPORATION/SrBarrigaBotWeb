'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/app/Layout';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { RegisterPaymentModal } from '@/components/app/RegisterPaymentModal';
import { MonthTimelineGrid } from '@/components/app/MonthTimelineGrid';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { ReceiptPreview } from '@/components/app/ReceiptPreview';
import { useStudentDetail } from '@/hooks/useStudents';
import { useStudentPayments, useRemovePayment } from '@/hooks/usePayments';
import type { BillingStatus } from '@/types/student';
import type { Payment } from '@/types/payment';

const STATUS_LABEL: Record<BillingStatus, string> = {
    EM_DIA: 'EM DIA',
    ATRASADO: 'ATRASADO',
    ADIANTADO: 'ADIANTADO',
};

const STATUS_STYLE: Record<BillingStatus, string> = {
    EM_DIA: 'border-green-500 bg-green-500/10 text-green-500',
    ATRASADO: 'border-red-500 bg-red-500/10 text-red-500',
    ADIANTADO: 'border-blue-400 bg-blue-400/10 text-blue-400',
};

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function StatusBadge({ status }: { status: BillingStatus }) {
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 border text-xs tech-text tracking-wider ${STATUS_STYLE[status]}`}>
            <span className="w-1.5 h-1.5 bg-current" />
            {STATUS_LABEL[status]}
        </span>
    );
}

export default function StudentDetailPage() {
    const params = useParams<{ id: string }>();
    const studentId = params.id;

    const { data: detail, isLoading: isLoadingDetail, isError: isDetailError } = useStudentDetail(studentId);
    const {
        data: payments,
        isLoading: isLoadingPayments,
        isFetching: isFetchingPayments,
        isError: isPaymentsError,
        refetch: refetchPayments,
    } = useStudentPayments(studentId);
    const removeMutation = useRemovePayment(studentId);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [removingPayment, setRemovingPayment] = useState<Payment | null>(null);
    const [previewPaymentId, setPreviewPaymentId] = useState<string | null>(null);
    const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);

    // Derivado do cache: quando a query é refeita, a preview passa a usar a signed URL nova.
    const previewPayment = payments?.find((payment) => payment.id === previewPaymentId) ?? null;

    // A signed URL do comprovante expira, então a lista é refeita antes de abrir a preview
    // para garantir um link válido mesmo com a tela aberta há muito tempo.
    const handleOpenReceipt = async (payment: Payment) => {
        setOpeningReceiptId(payment.id);
        try {
            const result = await refetchPayments();
            if (result.isError) return;

            const fresh = result.data?.find((item) => item.id === payment.id);
            if (fresh?.receiptUrl) {
                setPreviewPaymentId(fresh.id);
            }
        } finally {
            setOpeningReceiptId(null);
        }
    };

    const handleConfirmRemove = async () => {
        if (!removingPayment) return;

        try {
            await removeMutation.mutateAsync(removingPayment.id);
            setRemovingPayment(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao estornar payment');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <Link
                        href="/students"
                        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
                        </svg>
                        VOLTAR PARA ALUNOS
                    </Link>

                    {isLoadingDetail ? (
                        <div className="flex items-center gap-4 py-4">
                            <Loading.Root size="lg" />
                            <p className="text-white/70 body-text">Carregando dados do aluno...</p>
                        </div>
                    ) : isDetailError || !detail ? (
                        <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center">
                            <p className="text-white body-text">
                                Não foi possível carregar os dados deste aluno.
                            </p>
                        </div>
                    ) : (
                        <div className="border-b-2 border-white/20 pb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <div className="space-y-3">
                                <h1 className="text-3xl lg:text-4xl text-white">
                                    {detail.student.name}
                                </h1>
                                <p className="text-sm tech-text text-white/50 tracking-wider">
                                    MATRÍCULA {detail.student.matricula} · {detail.student.phone}
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <StatusBadge status={detail.status} />
                                    <span className={`text-sm body-text ${detail.saldo < 0 ? 'text-red-400' : 'text-white/70'}`}>
                                        Saldo: {formatCurrency(detail.saldo)}
                                    </span>
                                    {detail.status === 'ATRASADO' && (
                                        <span className="text-sm text-red-400/80 body-text">
                                            {formatCurrency(detail.valorAtraso)} em atraso · {detail.mesesDevidos} {detail.mesesDevidos === 1 ? 'mês devido' : 'meses devidos'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button.Root variant="primary" size="md" onClick={() => setIsPaymentModalOpen(true)}>
                                <Button.Icon>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                                    </svg>
                                </Button.Icon>
                                <Button.Text>REGISTRAR PAGAMENTO</Button.Text>
                            </Button.Root>
                        </div>
                    )}
                </div>

                {!isLoadingDetail && !isDetailError && detail && (
                    <div className="space-y-4">
                        <h2 className="text-lg tech-text text-white/70 tracking-wider">
                            MÊS A MÊS
                        </h2>
                        <MonthTimelineGrid months={detail.statusMesAMes} />
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-lg tech-text text-white/70 tracking-wider">
                        HISTÓRICO DE PAGAMENTOS
                    </h2>

                    {isLoadingPayments ? (
                        <div className="flex flex-col items-center gap-4 py-16">
                            <Loading.Root size="lg" />
                            <p className="text-white/70 body-text">Carregando pagamentos...</p>
                        </div>
                    ) : isPaymentsError ? (
                        <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center">
                            <p className="text-white body-text">
                                Não foi possível carregar o histórico de pagamentos.
                            </p>
                        </div>
                    ) : !payments || payments.length === 0 ? (
                        <div className="bg-[#0A0A0A] border-2 border-white/30 p-12 text-center space-y-3">
                            <p className="text-white body-text text-lg">
                                Nenhum pagamento registrado ainda
                            </p>
                            <p className="text-sm text-white/50 body-text">
                                Clique em &quot;REGISTRAR PAGAMENTO&quot; para lançar o primeiro
                            </p>
                        </div>
                    ) : (
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.Cell as="th">Data</Table.Cell>
                                    <Table.Cell as="th">Valor</Table.Cell>
                                    <Table.Cell as="th">Nota</Table.Cell>
                                    <Table.Cell as="th">Comprovante</Table.Cell>
                                    <Table.Cell as="th">Ações</Table.Cell>
                                </Table.Row>
                            </Table.Header>
                            <tbody>
                                {payments.map((payment) => (
                                    <Table.Row key={payment.id}>
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
                                            <button
                                                onClick={() => setRemovingPayment(payment)}
                                                className="p-2 border border-red-500/50 text-red-500/80 hover:text-red-500 hover:border-red-500 transition-colors"
                                                aria-label={`Estornar pagamento de ${formatCurrency(payment.amount)}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </tbody>
                        </Table.Root>
                    )}
                </div>
            </div>

            <RegisterPaymentModal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                studentId={studentId}
            />

            <ReceiptPreview
                open={!!previewPayment?.receiptUrl}
                onClose={() => setPreviewPaymentId(null)}
                receiptUrl={previewPayment?.receiptUrl ?? null}
                subtitle={previewPayment ? `${formatCurrency(previewPayment.amount)} · ${formatDate(previewPayment.paidAt)}` : undefined}
                onRefresh={() => refetchPayments()}
                isRefreshing={isFetchingPayments}
            />

            <ConfirmDialog
                open={!!removingPayment}
                onClose={() => setRemovingPayment(null)}
                onConfirm={handleConfirmRemove}
                title="ESTORNAR PAGAMENTO"
                description={`Tem certeza que deseja estornar o pagamento de ${removingPayment ? formatCurrency(removingPayment.amount) : ''}? Essa ação não poderá ser desfeita.`}
                confirmLabel="ESTORNAR"
                loading={removeMutation.isPending}
                variant="danger"
            />
        </DashboardLayout>
    );
}
