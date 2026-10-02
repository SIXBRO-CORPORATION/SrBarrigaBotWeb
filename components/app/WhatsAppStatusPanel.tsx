'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel, PANEL_ACCENT, type PanelAccent } from '@/components/ui/Panel';
import { WhatsAppStatusBadgeSkeleton, WhatsAppStatusBodySkeleton } from '@/components/app/WhatsAppSkeleton';

export type WhatsAppView = 'loading' | 'offline' | 'connected' | 'disconnected';

const CHAT_ICON =
    'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';

interface WhatsAppStatusPanelProps {
    view: WhatsAppView;
    isConnecting: boolean;
    isDisconnecting: boolean;
    isChargeRunning: boolean;
    onConnect: () => void;
    onOpenQR: () => void;
    onDisconnect: () => void;
    className?: string;
}

function getTone(view: WhatsAppView, isConnecting: boolean): { accent: PanelAccent; badge: string } {
    if (view === 'connected') return { accent: 'success', badge: 'CONECTADO' };
    if (view === 'offline') return { accent: 'warning', badge: 'SEM CONEXÃO' };
    if (view === 'disconnected' && isConnecting) return { accent: 'warning', badge: 'AGUARDANDO QR CODE' };
    if (view === 'disconnected') return { accent: 'danger', badge: 'DESCONECTADO' };
    return { accent: 'default', badge: '' };
}

function getCopy(view: WhatsAppView, isConnecting: boolean): { title: string; text: string } {
    if (view === 'connected') {
        return { title: 'Sessão ativa do WhatsApp detectada', text: 'O bot está pronto para enviar mensagens automáticas' };
    }
    if (view === 'offline') {
        return { title: 'Sem conexão com o servidor', text: 'Tentando reconectar automaticamente...' };
    }
    if (isConnecting) {
        return { title: 'Conexão em andamento', text: 'Escaneie o QR Code para concluir a conexão' };
    }
    return { title: 'Nenhuma sessão ativa encontrada', text: 'Conecte seu WhatsApp para ativar o bot de lembretes' };
}

function DisconnectMenu({ onDisconnect, disabled, disabledReason }: { onDisconnect: () => void; disabled: boolean; disabledReason?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Mais opções"
                className="w-9 h-9 flex items-center justify-center border-2 border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-colors chamfer-sm"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="12" cy="19" r="1.6" />
                </svg>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 z-20 border-2 border-white/20 bg-[#0A0A0A] chamfer-sm animate-fade-in"
                >
                    <button
                        type="button"
                        role="menuitem"
                        disabled={disabled}
                        title={disabled ? disabledReason : undefined}
                        onClick={() => {
                            setOpen(false);
                            onDisconnect();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        DESCONECTAR
                    </button>
                </div>
            )}
        </div>
    );
}

export function WhatsAppStatusPanel({
    view,
    isConnecting,
    isDisconnecting,
    isChargeRunning,
    onConnect,
    onOpenQR,
    onDisconnect,
    className,
}: WhatsAppStatusPanelProps) {
    const { accent, badge } = getTone(view, isConnecting);
    const style = PANEL_ACCENT[accent];
    const copy = getCopy(view, isConnecting);
    const isLoading = view === 'loading';

    return (
        <Panel accent={accent} className={className}>
            <div className={`pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl ${style.tint}`} />

            <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl mb-2 text-white">STATUS DA CONEXÃO</h2>
                        <p className="text-xs tech-text text-white/40 tracking-wider">
                            WHATSAPP BOT • {view === 'offline' ? 'RECONECTANDO' : 'TEMPO REAL'}
                        </p>
                    </div>

                    {isLoading ? (
                        <WhatsAppStatusBadgeSkeleton />
                    ) : (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <div key={badge} className={`px-4 py-2 border-2 ${style.border} ${style.tint}`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 animate-pulse-soft ${style.frame}`} />
                                    <span className={`text-xs tech-text tracking-wider ${style.text}`}>{badge}</span>
                                </div>
                            </div>

                            {view === 'connected' && (
                                <DisconnectMenu
                                    onDisconnect={onDisconnect}
                                    disabled={isDisconnecting || isChargeRunning}
                                    disabledReason={isChargeRunning ? 'Aguarde a cobrança terminar para desconectar' : undefined}
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/10 mb-6" />

                {isLoading ? (
                    <WhatsAppStatusBodySkeleton />
                ) : (
                    <div
                        key={`${view}-${isConnecting}`}
                        className="flex flex-col sm:flex-row sm:items-center gap-6 animate-fade-in"
                    >
                        <div className="relative w-20 h-20 shrink-0">
                            {view === 'connected' && (
                                <span className={`absolute inset-0 chamfer animate-radar motion-reduce:hidden ${style.frame}`} />
                            )}
                            <div
                                className={`relative w-full h-full chamfer flex items-center justify-center ${style.tint} ${style.text} ${
                                    isConnecting ? 'animate-pulse-soft' : ''
                                }`}
                            >
                                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d={CHAT_ICON} />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-white body-text mb-1">{copy.title}</p>
                                <p className="text-xs text-white/50 body-text">{copy.text}</p>
                            </div>

                            {view === 'disconnected' && (
                                <Button.Root variant="primary" size="md" onClick={isConnecting ? onOpenQR : onConnect}>
                                    <Button.Icon>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </Button.Icon>
                                    <Button.Text>{isConnecting ? 'VER QR CODE' : 'CONECTAR WHATSAPP'}</Button.Text>
                                </Button.Root>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
