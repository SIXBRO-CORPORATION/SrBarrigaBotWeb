import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';

export function StudentHeaderSkeleton() {
    return (
        <div
            className="border-b-2 border-white/20 pb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
            role="status"
            aria-label="Carregando dados do aluno"
        >
            <div className="space-y-3">
                <Skeleton.Root className="h-8 w-56 max-w-full" />
                <Skeleton.Root className="h-4 w-48 max-w-full" />
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton.Root className="h-6 w-24" />
                    <Skeleton.Root className="h-4 w-32" />
                </div>
            </div>

            <Skeleton.Root className="h-11 w-56" />
        </div>
    );
}

export function MonthTimelineSkeleton() {
    return (
        <div className="space-y-3" role="status" aria-label="Carregando mês a mês">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton.Root key={index} className="h-[60px] w-full" />
                ))}
            </div>
            <Skeleton.Root className="h-3 w-40" />
        </div>
    );
}

function PaymentHistoryRowSkeleton() {
    return (
        <Table.Row>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-20" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-24" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-6 w-24" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-28" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-12" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="w-8 h-8" />
            </Table.Cell>
        </Table.Row>
    );
}

export function PaymentsHistorySkeleton() {
    return (
        <div role="status" aria-label="Carregando histórico de pagamentos">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Cell as="th">Data</Table.Cell>
                        <Table.Cell as="th">Valor</Table.Cell>
                        <Table.Cell as="th">Status</Table.Cell>
                        <Table.Cell as="th">Nota</Table.Cell>
                        <Table.Cell as="th">Comprovante</Table.Cell>
                        <Table.Cell as="th">Ações</Table.Cell>
                    </Table.Row>
                </Table.Header>
                <tbody>
                    <PaymentHistoryRowSkeleton />
                    <PaymentHistoryRowSkeleton />
                    <PaymentHistoryRowSkeleton />
                    <PaymentHistoryRowSkeleton />
                </tbody>
            </Table.Root>
        </div>
    );
}
