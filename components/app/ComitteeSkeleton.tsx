import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';

function MemberRowSkeleton() {
    return (
        <Table.Row>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-32" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-44" />
            </Table.Cell>
            <Table.Cell>
                <Skeleton.Root className="h-4 w-20" />
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

export function ComitteeSkeleton() {
    return (
        <div role="status" aria-label="Carregando membros da comissão">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Cell as="th">Nome</Table.Cell>
                        <Table.Cell as="th">E-mail</Table.Cell>
                        <Table.Cell as="th">Criado em</Table.Cell>
                        <Table.Cell as="th">Ações</Table.Cell>
                    </Table.Row>
                </Table.Header>
                <tbody>
                    <MemberRowSkeleton />
                    <MemberRowSkeleton />
                    <MemberRowSkeleton />
                    <MemberRowSkeleton />
                </tbody>
            </Table.Root>
        </div>
    );
}
