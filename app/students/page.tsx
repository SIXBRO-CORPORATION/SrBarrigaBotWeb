'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/app/Layout';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StudentsSkeleton } from '@/components/app/StudentsSkeleton';
import { StudentFormModal } from '@/components/app/StudentFormModal';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { useStudents, useRemoveStudent } from '@/hooks/useStudents';
import type { BillingStatus, Student, StudentSummary } from '@/types/student';

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

function StatusBadge({ status }: { status: BillingStatus }) {
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 border text-xs tech-text tracking-wider ${STATUS_STYLE[status]}`}>
            <span className="w-1.5 h-1.5 bg-current" />
            {STATUS_LABEL[status]}
        </span>
    );
}

export default function StudentsPage() {
    const { data: students, isLoading, isError } = useStudents();
    const removeMutation = useRemoveStudent();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
    const [removingStudent, setRemovingStudent] = useState<Student | null>(null);

    const openCreateModal = () => {
        setEditingStudent(undefined);
        setIsFormOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingStudent(undefined);
    };

    const handleConfirmRemove = async () => {
        if (!removingStudent) return;

        try {
            await removeMutation.mutateAsync(removingStudent.id);
            setRemovingStudent(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao remover aluno');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                            ALUNOS
                        </h1>
                        <p className="text-sm tech-text text-white/50 tracking-wider">
                            GESTÃO DE ALUNOS E SALDO DE MENSALIDADES
                        </p>
                    </div>

                    <Button.Root variant="primary" size="md" onClick={openCreateModal}>
                        <Button.Icon>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                            </svg>
                        </Button.Icon>
                        <Button.Text>NOVO ALUNO</Button.Text>
                    </Button.Root>
                </div>

                {isLoading ? (
                    <StudentsSkeleton />
                ) : isError ? (
                    <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center space-y-2">
                        <p className="text-white body-text">
                            Não foi possível carregar a lista de alunos.
                        </p>
                        <p className="text-xs text-white/50 body-text">
                            Confira se a mensalidade e a data de início de cobrança já foram
                            configuradas em CONFIGURAÇÕES — o backend exige isso para calcular o saldo.
                        </p>
                    </div>
                ) : !students || students.length === 0 ? (
                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-12 text-center space-y-3">
                        <p className="text-white body-text text-lg">
                            Nenhum aluno cadastrado ainda
                        </p>
                        <p className="text-sm text-white/50 body-text">
                            Clique em &quot;NOVO ALUNO&quot; para começar
                        </p>
                    </div>
                ) : (
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
                            {students.map((summary: StudentSummary) => (
                                <Table.Row key={summary.student.id}>
                                    <Table.Cell>
                                        <Link
                                            href={`/students/${summary.student.id}`}
                                            className="hover:underline"
                                        >
                                            {summary.student.name}
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell>{summary.student.matricula}</Table.Cell>
                                    <Table.Cell>{summary.student.phone}</Table.Cell>
                                    <Table.Cell>
                                        <span className={summary.saldo < 0 ? 'text-red-400' : undefined}>
                                            {formatCurrency(summary.saldo)}
                                        </span>
                                        {summary.status === 'ATRASADO' && (
                                            <span className="block text-xs text-red-400/80 mt-0.5">
                                                {formatCurrency(summary.valorAtraso)} em atraso
                                            </span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={summary.status} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(summary.student)}
                                                className="p-2 border border-white/30 text-white/70 hover:text-white hover:border-white transition-colors"
                                                aria-label={`Editar ${summary.student.name}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setRemovingStudent(summary.student)}
                                                className="p-2 border border-red-500/50 text-red-500/80 hover:text-red-500 hover:border-red-500 transition-colors"
                                                aria-label={`Remover ${summary.student.name}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

            <StudentFormModal
                open={isFormOpen}
                onClose={closeFormModal}
                student={editingStudent}
            />

            <ConfirmDialog
                open={!!removingStudent}
                onClose={() => setRemovingStudent(null)}
                onConfirm={handleConfirmRemove}
                title="REMOVER ALUNO"
                description={`Tem certeza que deseja remover ${removingStudent?.name ?? 'este aluno'}? Ele deixa de ser cobrado, mas o histórico de pagamentos é mantido`}
                confirmLabel="REMOVER"
                loading={removeMutation.isPending}
                variant="danger"
            />
        </DashboardLayout>
    );
}
