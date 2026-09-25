'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/app/Layout';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Loading } from '@/components/ui/Loading';
import { UserFormModal } from '@/components/app/UserFormModal';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { useUsers, useDeleteUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/user';

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function ComitteePage() {
    const { data: users, isLoading, isError } = useUsers();
    const { user: currentUser } = useAuth();
    const removeMutation = useDeleteUser();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [removingUser, setRemovingUser] = useState<User | null>(null);

    const openCreateModal = () => {
        setEditingUser(undefined);
        setIsFormOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingUser(undefined);
    };

    const handleConfirmRemove = async () => {
        if (!removingUser) return;

        try {
            await removeMutation.mutateAsync(removingUser.id);
            setRemovingUser(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao remover usuário');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                            COMISSÃO
                        </h1>
                        <p className="text-sm tech-text text-white/50 tracking-wider">
                            GESTÃO DOS USUÁRIOS COM ACESSO AO SISTEMA
                        </p>
                    </div>

                    <Button.Root variant="primary" size="md" onClick={openCreateModal}>
                        <Button.Icon>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                            </svg>
                        </Button.Icon>
                        <Button.Text>NOVO MEMBRO</Button.Text>
                    </Button.Root>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-16">
                        <Loading.Root size="lg" />
                        <p className="text-white/70 body-text">Carregando membros...</p>
                    </div>
                ) : isError ? (
                    <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center space-y-2">
                        <p className="text-white body-text">
                            Não foi possível carregar a lista de membros da comissão.
                        </p>
                    </div>
                ) : !users || users.length === 0 ? (
                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-12 text-center space-y-3">
                        <p className="text-white body-text text-lg">
                            Nenhum membro cadastrado ainda
                        </p>
                        <p className="text-sm text-white/50 body-text">
                            Clique em &quot;NOVO MEMBRO&quot; para começar
                        </p>
                    </div>
                ) : (
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
                            {users.map((user) => {
                                const isSelf = user.id === currentUser?.id;

                                return (
                                    <Table.Row key={user.id}>
                                        <Table.Cell>
                                            {user.name}
                                            {isSelf && (
                                                <span className="ml-2 text-xs text-white/40 tech-text">(VOCÊ)</span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>{user.email}</Table.Cell>
                                        <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 border border-white/30 text-white/70 hover:text-white hover:border-white transition-colors"
                                                    aria-label={`Editar ${user.name}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setRemovingUser(user)}
                                                    disabled={isSelf}
                                                    className="p-2 border border-red-500/50 text-red-500/80 hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-red-500/80 disabled:hover:border-red-500/50"
                                                    aria-label={isSelf ? 'Você não pode remover seu próprio usuário' : `Remover ${user.name}`}
                                                    title={isSelf ? 'Você não pode remover seu próprio usuário' : undefined}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </tbody>
                    </Table.Root>
                )}
            </div>

            <UserFormModal
                open={isFormOpen}
                onClose={closeFormModal}
                user={editingUser}
            />

            <ConfirmDialog
                open={!!removingUser}
                onClose={() => setRemovingUser(null)}
                onConfirm={handleConfirmRemove}
                title="REMOVER MEMBRO"
                description={`Tem certeza que deseja remover ${removingUser?.name ?? 'este usuário'}? Ele perde o acesso ao sistema imediatamente`}
                confirmLabel="REMOVER"
                loading={removeMutation.isPending}
                variant="danger"
            />
        </DashboardLayout>
    );
}
