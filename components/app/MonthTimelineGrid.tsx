'use client';

import React from 'react';
import type { StudentMonthStatus } from '@/types/student';

interface MonthTimelineGridProps {
    months: StudentMonthStatus[];
}

function formatMonthLabel(referencia: string): string {
    const date = new Date(`${referencia}-01T00:00:00Z`);
    const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    return label.replace('.', '');
}

function MonthPill({ month }: { month: StudentMonthStatus }) {
    const isOk = month.status === 'OK';

    return (
        <div
            title={`Mês ${month.numero} (${month.referencia}) — ${isOk ? 'pago' : 'pendente'}`}
            className={`
                flex flex-col items-center justify-center gap-1 px-2 py-3 border
                ${isOk ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}
            `}
        >
            {isOk ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className={`text-[11px] tech-text tracking-wider ${isOk ? 'text-green-500' : 'text-red-500'}`}>
                {formatMonthLabel(month.referencia)}
            </span>
        </div>
    );
}

export function MonthTimelineGrid({ months }: MonthTimelineGridProps) {
    if (months.length === 0) {
        return (
            <div className="bg-[#0A0A0A] border-2 border-white/30 p-8 text-center">
                <p className="text-white/70 body-text">
                    A cobrança deste aluno ainda não começou.
                </p>
            </div>
        );
    }

    const pendingCount = months.filter((m) => m.status === 'PENDENTE').length;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {months.map((month) => (
                    <MonthPill key={month.numero} month={month} />
                ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-white/50 body-text">
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500" />
                    {months.length - pendingCount} em dia
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500" />
                    {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
                </span>
            </div>
        </div>
    );
}
