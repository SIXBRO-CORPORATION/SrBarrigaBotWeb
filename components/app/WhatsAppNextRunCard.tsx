'use client';

import React from 'react';
import Link from 'next/link';
import { Panel, PanelTitle } from '@/components/ui/Panel';
import { WhatsAppAutomationValueSkeleton } from '@/components/app/WhatsAppSkeleton';
import { useSystemConfig } from '@/hooks/useConfig';
import { SYSTEM_CONFIG_KEYS } from '@/types/config';

const CALENDAR_ICON =
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';

const FORTALEZA_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function nextChargeRun(day: string, time: string): { label: string; relative: string } | null {
    const match = /^(\d{2}):(\d{2})$/.exec(time);
    const dayOfMonth = Number(day);
    if (!match || !Number.isInteger(dayOfMonth) || dayOfMonth < 1) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    const now = new Date(Date.now() - FORTALEZA_OFFSET_MS);
    let next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), dayOfMonth, hour, minute);
    if (next <= now.getTime()) {
        next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, dayOfMonth, hour, minute);
    }

    const date = new Date(next);
    const pad = (n: number) => String(n).padStart(2, '0');
    const label = `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)} às ${pad(hour)}:${pad(minute)}`;

    const hours = (next - now.getTime()) / HOUR_MS;
    const days = Math.floor(hours / 24);
    const relative =
        hours < 1 ? 'EM MENOS DE 1 HORA' : hours < 24 ? `EM ${Math.floor(hours)}H` : `EM ${days} ${days === 1 ? 'DIA' : 'DIAS'}`;

    return { label, relative };
}

export function WhatsAppNextRunCard({ className }: { className?: string }) {
    const { data: configs, isLoading } = useSystemConfig();
    const chargeDay = configs?.find((c) => c.key === SYSTEM_CONFIG_KEYS.CHARGE_DAY)?.value ?? '';
    const chargeTime = configs?.find((c) => c.key === SYSTEM_CONFIG_KEYS.CHARGE_TIME)?.value ?? '';
    const next = chargeDay && chargeTime ? nextChargeRun(chargeDay, chargeTime) : null;

    return (
        <Panel delay={100} className={className}>
            <PanelTitle icon={CALENDAR_ICON}>PRÓXIMA EXECUÇÃO</PanelTitle>

            {isLoading ? (
                <WhatsAppAutomationValueSkeleton />
            ) : (
                <div className="animate-fade-in">
                    <p className="font-heading text-2xl text-white leading-none">{next?.label ?? 'Não configurada'}</p>

                    {next && (
                        <span className="inline-block mt-4 px-2 py-1 border border-white/30 text-[10px] tech-text text-white/70">
                            {next.relative}
                        </span>
                    )}

                    <p className="text-xs text-white/40 mt-4 body-text">
                        {next ? `Dia ${chargeDay.padStart(2, '0')} de cada mês` : 'Defina o dia e o horário em Configurações'}
                    </p>
                </div>
            )}

            <Link
                href="/settings"
                className="inline-block mt-5 text-[10px] tech-text tracking-wider text-white/50 hover:text-white transition-colors"
            >
                AJUSTAR EM CONFIGURAÇÕES →
            </Link>
        </Panel>
    );
}
