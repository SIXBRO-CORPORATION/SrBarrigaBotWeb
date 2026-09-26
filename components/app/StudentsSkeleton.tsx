import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';

function StudentRowSkeleton() {
    return (
        <Table.Row>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-32" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-16" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-28" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-24" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-6 w-24" />
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

export function StudentsSkeleton() {
    return (
        <div role="status" aria-label="Carregando lista de alunos">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Cell as="th">Nome</Table.Cell>
                        <Table.Cell as="th">Matrícula</Table.Cell>
                        <Table.Cell as="th">Telefone</Table.Cell>
                        <Table.Cell as="th">Saldo</Table.Cell>
                        <Table.Cell as="th">Status</Table.Cell>
                        <Table.Cell as="th">Ações</Table.Cell>
                    </Table.Row>
                </Table.Header>
                <tbody>
                    <StudentRowSkeleton />
                    <StudentRowSkeleton />
                    <StudentRowSkeleton />
                    <StudentRowSkeleton />
                    <StudentRowSkeleton />
                    <StudentRowSkeleton />
                </tbody>
            </Table.Root>
        </div>
    );
}
