'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/app/Layout';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { EntryFormModal } from '@/components/app/EntryFormModal';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { useEntries, useRemoveEntry } from '@/hooks/useEntries';
import type { Entry } from '@/types/entry';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EntriesPage() {
    const { data: entries, isLoading, isError } = useEntries();
    const removeMutation = useRemoveEntry();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined);
    const [removingEntry, setRemovingEntry] = useState<Entry | null>(null);

    const openForm = (entry?: Entry) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingEntry(undefined);
    };

    const handleConfirmRemove = async () => {
        if (!removingEntry) return;

        try {
            await removeMutation.mutateAsync(removingEntry.id);
            setRemovingEntry(null);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao remover lançamento');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl mb-2 text-white">LANÇAMENTOS</h1>
                        <p className="text-sm tech-text text-white/50 tracking-wider">
                            GASTOS E LUCROS QUE ALTERAM O TOTAL ARRECADADO
                        </p>
                    </div>

                    <Button.Root variant="primary" size="md" onClick={() => openForm()}>
                        <Button.Icon>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                            </svg>
                        </Button.Icon>
                        <Button.Text>NOVO LANÇAMENTO</Button.Text>
                    </Button.Root>
                </div>

                {isLoading ? (
                    <div role="status" aria-label="Carregando lançamentos" className="space-y-3">
                        <Skeleton.Root className="h-12 w-full" />
                        <Skeleton.Root className="h-12 w-full" />
                        <Skeleton.Root className="h-12 w-full" />
                    </div>
                ) : isError ? (
                    <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center">
                        <p className="text-white body-text">Não foi possível carregar os lançamentos.</p>
                    </div>
                ) : !entries || entries.length === 0 ? (
                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-12 text-center space-y-3">
                        <p className="text-white body-text text-lg">Nenhum lançamento ainda</p>
                        <p className="text-sm text-white/50 body-text">
                            Clique em &quot;NOVO LANÇAMENTO&quot; para começar
                        </p>
                    </div>
                ) : (
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Cell as="th">Tipo</Table.Cell>
                                <Table.Cell as="th">Título</Table.Cell>
                                <Table.Cell as="th">Detalhes</Table.Cell>
                                <Table.Cell as="th">Valor</Table.Cell>
                                <Table.Cell as="th">Ações</Table.Cell>
                            </Table.Row>
                        </Table.Header>
                        <tbody>
                            {entries.map((entry) => {
                                const isGasto = entry.type === 'GASTO';
                                return (
                                    <Table.Row key={entry.id}>
                                        <Table.Cell>
                                            <span
                                                className={`inline-flex items-center gap-2 px-3 py-1 border text-xs tech-text tracking-wider ${
                                                    isGasto
                                                        ? 'border-red-500 bg-red-500/10 text-red-500'
                                                        : 'border-green-500 bg-green-500/10 text-green-500'
                                                }`}
                                            >
                                                <span className="w-1.5 h-1.5 bg-current" />
                                                {entry.type}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>{entry.title}</Table.Cell>
                                        <Table.Cell>
                                            <span className="text-white/60">{entry.details || '—'}</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className={isGasto ? 'text-red-400' : 'text-green-400'}>
                                                {isGasto ? '−' : '+'} {formatCurrency(entry.amount)}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openForm(entry)}
                                                    className="p-2 border border-white/30 text-white/70 hover:text-white hover:border-white transition-colors"
                                                    aria-label={`Editar ${entry.title}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setRemovingEntry(entry)}
                                                    className="p-2 border border-red-500/50 text-red-500/80 hover:text-red-500 hover:border-red-500 transition-colors"
                                                    aria-label={`Remover ${entry.title}`}
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

            <EntryFormModal open={isFormOpen} onClose={closeForm} entry={editingEntry} />

            <ConfirmDialog
                open={!!removingEntry}
                onClose={() => setRemovingEntry(null)}
                onConfirm={handleConfirmRemove}
                title="REMOVER LANÇAMENTO"
                description={`Tem certeza que deseja remover "${removingEntry?.title ?? 'este lançamento'}"? O total arrecadado será recalculado`}
                confirmLabel="REMOVER"
                loading={removeMutation.isPending}
                variant="danger"
            />
        </DashboardLayout>
    );
}
