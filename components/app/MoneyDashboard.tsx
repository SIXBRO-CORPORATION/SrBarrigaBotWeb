'use client';

import React from 'react';
import { DashboardSkeleton } from '@/components/app/DashboardSkeleton';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useCountUp } from '@/hooks/useCountUp';
import type { DashboardSummary } from '@/types/dashboard';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type Accent = 'default' | 'danger' | 'success' | 'info';

const ACCENT: Record<Accent, { frame: string; text: string; border: string }> = {
    default: { frame: 'bg-white/20', text: 'text-white', border: 'border-white/30' },
    danger: { frame: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    success: { frame: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
    info: { frame: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-400' },
};

const ICON = {
    money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
};

function Panel({
    accent = 'default',
    delay = 0,
    className = '',
    children,
}: {
    accent?: Accent;
    delay?: number;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`chamfer p-[2px] ${ACCENT[accent].frame} animate-fade-in ${className}`}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div className="chamfer relative h-full overflow-hidden bg-[#0A0A0A] p-6">{children}</div>
        </div>
    );
}

function PanelTitle({ icon, children }: { icon: keyof typeof ICON; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 shrink-0 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d={ICON[icon]} />
                </svg>
            </div>
            <h3 className="text-sm tech-text text-white/70 tracking-wider">{children}</h3>
        </div>
    );
}

function Ring({ percent }: { percent: number }) {
    const r = 28;
    const c = 2 * Math.PI * r;
    const filled = Math.min(Math.max(percent, 0), 100);

    return (
        <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-white/10" />
                <circle
                    cx="36"
                    cy="36"
                    r={r}
                    fill="none"
                    strokeWidth="7"
                    className="stroke-white"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - filled / 100)}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white tabular-nums tech-text">
                {Math.round(percent)}%
            </span>
        </div>
    );
}

function HeroPanel({ summary }: { summary: DashboardSummary }) {
    const total = useCountUp(summary.valorContribuidoTotal, 1600);
    const percent = summary.valorEsperadoTotal > 0 ? (total / summary.valorEsperadoTotal) * 100 : 0;

    return (
        <Panel className="lg:col-span-8">
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
                <PanelTitle icon="check">TOTAL ARRECADADO</PanelTitle>

                <p className="font-heading text-3xl sm:text-5xl xl:text-6xl text-white text-glow tabular-nums leading-none">
                    {formatCurrency(total)}
                </p>
                <p className="text-xs text-white/40 body-text mt-3">Total de pagamentos registrados</p>

                <div className="mt-8">
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                        <span className="text-xs tech-text text-white/60 tabular-nums">
                            {Math.round(percent)}% DO ESPERADO
                        </span>
                        <span className="text-xs text-white/40 body-text text-right">
                            Esperado: {formatCurrency(summary.valorEsperadoTotal)}
                        </span>
                    </div>
                    <div className="h-3 bg-white/10 chamfer-sm">
                        <div className="h-full bg-white" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function BalancePanel({ summary }: { summary: DashboardSummary }) {
    const delinquent = useCountUp(Math.max(0, -summary.diferencaTotal), 1200, 150);
    const isBehind = summary.diferencaTotal < 0;
    const isAhead = summary.diferencaTotal > 0;
    const accent: Accent = isBehind ? 'danger' : isAhead ? 'info' : 'success';
    const style = ACCENT[accent];

    return (
        <Panel accent={accent} delay={100} className="lg:col-span-4">
            <PanelTitle icon="warning">INADIMPLÊNCIA</PanelTitle>

            <p className={`font-heading text-3xl xl:text-4xl tabular-nums leading-none ${style.text}`}>
                {formatCurrency(delinquent)}
            </p>

            <span className={`inline-block mt-4 px-2 py-1 border text-[10px] tech-text ${style.border} ${style.text}`}>
                {isBehind ? 'ATRASADA' : isAhead ? 'ADIANTADA' : 'EM DIA'}
            </span>

            <div className="text-xs text-white/40 mt-4 body-text space-y-0.5">
                {isBehind && <p>Turma atrasada em relação ao valor esperado</p>}
                {isAhead && <p>Turma adiantada em {formatCurrency(summary.diferencaTotal)}</p>}
                {!isBehind && !isAhead && <p>Turma em dia com o valor esperado</p>}
                <p>Saldo líquido: arrecadado − esperado</p>
            </div>
        </Panel>
    );
}

function ExpectedPanel({ summary }: { summary: DashboardSummary }) {
    const expected = useCountUp(summary.valorEsperadoTotal, 1300, 250);

    return (
        <Panel delay={200} className="lg:col-span-4">
            <PanelTitle icon="money">ESPERADO ATÉ HOJE</PanelTitle>
            <p className="font-heading text-2xl text-white tabular-nums leading-none">{formatCurrency(expected)}</p>
            <p className="text-xs text-white/40 mt-3 body-text">Acumulado até hoje, incluindo alunos removidos</p>
        </Panel>
    );
}

function MonthPanel({ summary }: { summary: DashboardSummary }) {
    const month = useCountUp(summary.arrecadadoNoMes, 1300, 350);
    const percent = summary.metaMensal > 0 ? (month / summary.metaMensal) * 100 : 0;

    return (
        <Panel delay={300} className="lg:col-span-4">
            <PanelTitle icon="calendar">ARRECADADO NO MÊS</PanelTitle>
            <p className="font-heading text-2xl text-white tabular-nums leading-none">{formatCurrency(month)}</p>

            <div className="flex items-center gap-4 mt-5">
                <Ring percent={percent} />
                <p className="text-xs text-white/40 body-text">
                    Meta mensal: {formatCurrency(summary.metaMensal)}
                </p>
            </div>
        </Panel>
    );
}

function TeamPanel({ summary }: { summary: DashboardSummary }) {
    const students = useCountUp(summary.alunosAtivos, 1000, 450);

    return (
        <Panel delay={400} className="lg:col-span-4">
            <PanelTitle icon="users">TURMA</PanelTitle>
            <p className="font-heading text-2xl text-white tabular-nums leading-none">
                {Math.round(students)}{' '}
                <span className="text-sm tech-text text-white/50">
                    {summary.alunosAtivos === 1 ? 'ALUNO ATIVO' : 'ALUNOS ATIVOS'}
                </span>
            </p>
            <p className="text-xs text-white/40 mt-3 body-text">
                Mensalidade por aluno: {formatCurrency(summary.mensalidade)}
            </p>
        </Panel>
    );
}

export function MoneyDashboard() {
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <HeroPanel summary={summary} />
            <BalancePanel summary={summary} />
            <ExpectedPanel summary={summary} />
            <MonthPanel summary={summary} />
            <TeamPanel summary={summary} />
        </div>
    );
}
