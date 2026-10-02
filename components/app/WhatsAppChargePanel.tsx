'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Panel, PanelTitle, PANEL_ACCENT, type PanelAccent } from '@/components/ui/Panel';
import { useCountUp } from '@/hooks/useCountUp';
import type { ChargeProgress } from '@/types/whatsapp';

const SEND_ICON = 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8';

function formatFinishedAt(iso?: string): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;

    const timeZone = 'America/Fortaleza';
    const day = date.toLocaleDateString('pt-BR', { timeZone, day: '2-digit', month: '2-digit' });
    const time = date.toLocaleTimeString('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit' });
    return `${day} às ${time}`;
}

function ProgressRing({ percent, stroke }: { percent: number; stroke: string }) {
    const shown = useCountUp(percent, 600);
    const r = 44;
    const c = 2 * Math.PI * r;

    return (
        <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-white/10" />
                <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    strokeWidth="8"
                    className={stroke}
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - Math.min(shown, 100) / 100)}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-heading text-xl text-white tabular-nums">
                {Math.round(shown)}%
            </span>
        </div>
    );
}

function Counter({ label, value, tone = 'text-white' }: { label: string; value: number; tone?: string }) {
    const shown = useCountUp(value, 500);

    return (
        <div className="bg-white/5 border border-white/20 px-4 py-3 min-w-[88px]">
            <p className={`font-heading text-2xl tabular-nums leading-none ${tone}`}>{Math.round(shown)}</p>
            <p className="text-[10px] tech-text text-white/50 mt-2">{label}</p>
        </div>
    );
}

interface WhatsAppChargePanelProps {
    charge: ChargeProgress;
    canRun: boolean;
    isStarting: boolean;
    onRun: () => void;
    className?: string;
}

export function WhatsAppChargePanel({ charge, canRun, isStarting, onRun, className }: WhatsAppChargePanelProps) {
    const isRunning = charge.status === 'running';
    const hasFailures = charge.failed > 0;
    const done = charge.sent + charge.failed;
    const percent = charge.total > 0 ? Math.min(100, (done / charge.total) * 100) : 0;
    const showProgress = charge.status !== 'idle' && charge.total > 0;

    const accent: PanelAccent =
        charge.status === 'failed'
            ? 'danger'
            : charge.status === 'completed' && charge.total > 0
              ? hasFailures
                  ? 'warning'
                  : 'success'
              : 'default';
    const style = PANEL_ACCENT[accent];

    let headline = 'ENVIAR LEMBRETES DE COBRANÇA';
    let description: string = 'Dispara agora a mensagem de cobrança para os alunos, fora do horário agendado.';
    let buttonLabel = 'EXECUTAR COBRANÇA AGORA';

    if (isRunning) {
        headline = 'ENVIANDO EM SEGUNDO PLANO';
        description = charge.total > 0 ? 'Mantenha esta página aberta para acompanhar o progresso.' : 'Buscando alunos...';
        buttonLabel = 'ENVIANDO...';
    } else if (charge.status === 'completed') {
        headline = charge.total === 0 ? 'NENHUM ALUNO A COBRAR' : hasFailures ? 'CONCLUÍDA COM FALHAS' : 'COBRANÇA CONCLUÍDA';
        const finishedAt = formatFinishedAt(charge.finishedAt);
        description = finishedAt ? `Finalizada em ${finishedAt}` : 'Cobrança finalizada.';
        buttonLabel = 'EXECUTAR NOVAMENTE';
    } else if (charge.status === 'failed') {
        headline = 'FALHA NA COBRANÇA';
        description = charge.error || 'Não foi possível executar a cobrança.';
        buttonLabel = 'TENTAR NOVAMENTE';
    }

    return (
        <Panel accent={accent} delay={200} className={className}>
            <PanelTitle icon={SEND_ICON}>COBRANÇA</PanelTitle>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div key={charge.status} className="space-y-3 max-w-xl animate-fade-in">
                    <h3 className={`text-2xl ${style.text}`}>{headline}</h3>
                    <p className="text-sm text-white/50 body-text">{description}</p>

                    {isRunning && charge.total === 0 && (
                        <div className="h-1 bg-white/10 overflow-hidden" role="status" aria-label="Buscando alunos">
                            <div className="h-full w-1/4 bg-white animate-line-loader" />
                        </div>
                    )}

                    <div className="pt-3">
                        <Button.Root
                            variant="primary"
                            size="md"
                            onClick={onRun}
                            loading={isStarting}
                            disabled={!canRun || isRunning || isStarting}
                        >
                            <Button.Icon>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d={SEND_ICON} />
                                </svg>
                            </Button.Icon>
                            <Button.Text>{buttonLabel}</Button.Text>
                        </Button.Root>
                    </div>

                    {!canRun && !isRunning && (
                        <p className="text-xs text-white/40 body-text">Conecte o WhatsApp para executar a cobrança.</p>
                    )}
                </div>

                {showProgress && (
                    <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
                        <ProgressRing percent={percent} stroke={style.stroke} />
                        <div className="flex gap-3">
                            <Counter label="ENVIADAS" value={charge.sent} tone={charge.sent > 0 ? 'text-green-500' : 'text-white'} />
                            <Counter label="FALHAS" value={charge.failed} tone={hasFailures ? 'text-red-500' : 'text-white'} />
                            <Counter label="TOTAL" value={charge.total} />
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
