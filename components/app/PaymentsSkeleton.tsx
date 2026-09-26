import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';

function PaymentRowSkeleton() {
    return (
        <Table.Row>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-32" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-20" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-24" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-28" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-12" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-3 w-24" />
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    <Skeleton.Root className="w-8 h-8" />
                    <Skeleton.Root className="w-8 h-8" />
                </div>
            </Table.Cell>
        </Table.Row>
    );
}

export function PaymentsSkeleton() {
    return (
        <div role="status" aria-label="Carregando pagamentos pendentes">
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
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                </tbody>
            </Table.Root>
        </div>
    );
}
