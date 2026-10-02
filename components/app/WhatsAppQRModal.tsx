'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { LottiePlayer } from '@/components/ui/LottiePlayer';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

const STEPS = [
    'Abra o WhatsApp no seu celular',
    'Vá em Configurações → Aparelhos conectados',
    'Toque em "Conectar um aparelho"',
    'Aponte para este QR Code',
];

const CHECK_ICON = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';

type Phase = 'loading' | 'qr' | 'connected';

interface WhatsAppQRModalProps {
    open: boolean;
    onClose: () => void;
    qrCode: string | null;
    isConnected: boolean;
}

export function WhatsAppQRModal({ open, onClose, qrCode, isConnected }: WhatsAppQRModalProps) {
    const phase: Phase = isConnected ? 'connected' : qrCode ? 'qr' : 'loading';
    const accentBorder = phase === 'connected' ? 'border-green-500' : 'border-white';
    const accentSoft = phase === 'connected' ? 'border-green-500/20' : 'border-white/20';

    return (
        <Modal.Root open={open} onClose={onClose} size="md">
            <div className={`bg-[#0A0A0A] border-2 ${accentBorder} chamfer overflow-hidden`}>
                <div className={`absolute inset-3 border ${accentSoft} chamfer-sm pointer-events-none`} />

                <div className={`relative p-6 border-b-2 ${accentSoft}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-8 h-8 shrink-0 flex items-center justify-center chamfer-sm border ${accentSoft} ${
                                    phase === 'connected' ? 'text-green-500' : 'text-white'
                                }`}
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-xl text-white">
                                {phase === 'connected' ? 'WHATSAPP CONECTADO' : 'CONECTAR WHATSAPP'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors"
                            aria-label="Fechar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="relative p-6 sm:p-8">
                    {/* key remonta o bloco a cada fase para fazer o fade entre elas */}
                    <div key={phase} className="flex flex-col items-center animate-fade-in">
                        {phase === 'loading' && (
                            <div role="status" className="flex flex-col items-center gap-2 py-4">
                                <LottiePlayer
                                    src="/animations/processing.lottie"
                                    loop
                                    className="w-40 h-40"
                                    fallback={<Loading.Root size="xl" />}
                                />
                                <p className="text-white body-text text-center">Gerando QR Code...</p>
                                <p className="text-xs text-white/40 body-text text-center">Isso leva só alguns segundos</p>
                            </div>
                        )}

                        {phase === 'qr' && qrCode && (
                            <div className="w-full space-y-6">
                                {/* key no QR: cada código novo entra com fade */}
                                <div key={qrCode} className="mx-auto max-w-[304px] animate-fade-in">
                                    <div className="relative bg-white p-5 chamfer-sm overflow-hidden">
                                        <QRCode
                                            value={qrCode}
                                            size={256}
                                            level="H"
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                        <div className="pointer-events-none absolute inset-x-0 h-0.5 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.9)] animate-scan motion-reduce:hidden" />
                                    </div>
                                </div>

                                <div role="status" className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 animate-pulse-soft" />
                                    <span className="text-xs tech-text tracking-wider text-white/60">AGUARDANDO LEITURA</span>
                                </div>

                                <ol className="bg-white/5 border border-white/20 p-4 space-y-3">
                                    {STEPS.map((step, index) => (
                                        <li key={step} className="flex items-start gap-3 text-xs text-white/60 body-text">
                                            <span className="w-5 h-5 shrink-0 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm tech-text text-[10px] text-white">
                                                {index + 1}
                                            </span>
                                            <span className="pt-0.5">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {phase === 'connected' && (
                            <div role="status" className="flex flex-col items-center gap-2 py-4">
                                <LottiePlayer
                                    src="/animations/success.lottie"
                                    className="w-40 h-40"
                                    fallback={
                                        <div className="w-16 h-16 bg-green-500/20 text-green-500 flex items-center justify-center chamfer">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                <path strokeLinecap="square" strokeLinejoin="miter" d={CHECK_ICON} />
                                            </svg>
                                        </div>
                                    }
                                />
                                <p className="text-green-500 body-text text-lg text-center">Conectado com sucesso!</p>
                                <p className="text-xs text-white/40 body-text text-center">O bot já pode enviar mensagens</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal.Root>
    );
}
