'use client';

import React from 'react';
import { DashboardSkeleton } from '@/components/app/DashboardSkeleton';
import { useDashboardSummary } from '@/hooks/useDashboard';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
    accent?: 'default' | 'danger' | 'success' | 'info';
}

const ACCENT_STYLE: Record<NonNullable<SummaryCardProps['accent']>, { border: string; value: string }> = {
    default: { border: 'border-white/30', value: 'text-white' },
    danger: { border: 'border-red-500', value: 'text-red-500' },
    success: { border: 'border-green-500', value: 'text-green-500' },
    info: { border: 'border-blue-400', value: 'text-blue-400' },
};

function SummaryCard({ title, value, icon, children, accent = 'default' }: SummaryCardProps) {
    const style = ACCENT_STYLE[accent];

    return (
        <div className={`bg-[#0A0A0A] border-2 ${style.border} p-6`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                    {icon}
                </div>
                <h3 className="text-sm tech-text text-white/70 tracking-wider">
                    {title}
                </h3>
            </div>
            <p className={`text-2xl body-text ${style.value}`}>
                {value}
            </p>
            <div className="text-xs text-white/40 mt-1 body-text space-y-0.5">
                {children}
            </div>
        </div>
    );
}

export function DashboardSummaryCards() {
    const { data: summary, isLoading, isError } = useDashboardSummary();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError || !summary) {
        return (
            <div className="bg-[#0A0A0A] border-2 border-red-500/50 p-8 text-center space-y-2">
                <p className="text-white body-text">
                    Não foi possível carregar o resumo financeiro.
                </p>
                <p className="text-xs text-white/50 body-text">
                    Confira se a mensalidade e a data de início de cobrança já foram
                    configuradas em CONFIGURAÇÕES — o backend exige isso para calcular o resumo.
                </p>
            </div>
        );
    }

    const isBehind = summary.diferencaTotal < 0;
    const isAhead = summary.diferencaTotal > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SummaryCard
                title="VALOR ESPERADO"
                value={formatCurrency(summary.valorEsperadoTotal)}
                icon={
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
            >
                <p>Acumulado até hoje, incluindo alunos removidos</p>
                <p>
                    Meta mensal: {formatCurrency(summary.metaMensal)} · {summary.alunosAtivos}{' '}
                    {summary.alunosAtivos === 1 ? 'aluno ativo' : 'alunos ativos'}
                </p>
            </SummaryCard>

            <SummaryCard
                title="ARRECADADO"
                value={formatCurrency(summary.valorContribuidoTotal)}
                icon={
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
            >
                <p>Total de pagamentos registrados</p>
                <p>No mês atual: {formatCurrency(summary.arrecadadoNoMes)}</p>
            </SummaryCard>

            <SummaryCard
                title="INADIMPLÊNCIA"
                value={formatCurrency(Math.max(0, -summary.diferencaTotal))}
                accent={isBehind ? 'danger' : isAhead ? 'info' : 'success'}
                icon={
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                }
            >
                {isBehind && <p>Turma atrasada em relação ao valor esperado</p>}
                {isAhead && <p>Turma adiantada em {formatCurrency(summary.diferencaTotal)}</p>}
                {!isBehind && !isAhead && <p>Turma em dia com o valor esperado</p>}
                <p>Saldo líquido: arrecadado − esperado</p>
            </SummaryCard>
        </div>
    );
}
