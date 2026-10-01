'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

const DotLottieReact = dynamic(
    () => import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
    { ssr: false }
);

const ANIMATIONS = {
    processing: '/animations/processing.lottie',
    success: '/animations/success.lottie',
} as const;

export type PaymentOverlayPhase = 'processing' | 'success' | 'error';

const COPY: Record<PaymentOverlayPhase, { title: string; description: string; action?: string }> = {
    processing: {
        title: 'ENVIANDO COMPROVANTE',
        description: 'Aguarde um instante e não feche esta página.',
    },
    success: {
        title: 'PAGAMENTO ENVIADO',
        description: 'Assim que conferirmos o comprovante, ele será aprovado.',
        action: 'REGISTRAR OUTRO PAGAMENTO',
    },
    error: {
        title: 'FALHA NO ENVIO',
        description: 'Não foi possível enviar o pagamento. Tente novamente.',
        action: 'VOLTAR E TENTAR DE NOVO',
    },
};

const CheckIcon = () => (
    <div className="w-20 h-20 bg-white text-black flex items-center justify-center chamfer-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

const ErrorIcon = () => (
    <div className="w-20 h-20 bg-red-600 text-white flex items-center justify-center chamfer-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 6l12 12M18 6L6 18" />
        </svg>
    </div>
);

const Visual: React.FC<{ phase: PaymentOverlayPhase }> = ({ phase }) => {
    if (phase === 'error') return <ErrorIcon />;

    return (
        <>
            <div className="w-60 h-60 motion-reduce:hidden">
                <DotLottieReact src={ANIMATIONS[phase]} autoplay loop={phase === 'processing'} />
            </div>
            {/* prefers-reduced-motion: sem Lottie, só o estado estático */}
            <div className="hidden motion-reduce:flex">
                {phase === 'processing' ? <Loading.Root size="xl" /> : <CheckIcon />}
            </div>
        </>
    );
};

interface PaymentStatusOverlayProps {
    phase: PaymentOverlayPhase;
    description?: string;
    onAction: () => void;
}

export const PaymentStatusOverlay: React.FC<PaymentStatusOverlayProps> = ({ phase, description, onAction }) => {
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const copy = COPY[phase];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-sm p-6 animate-fade-in">
            <div key={phase} className="flex flex-col items-center text-center gap-6 max-w-sm animate-fade-in">
                <Visual phase={phase} />

                <div role={phase === 'error' ? 'alert' : 'status'} className="space-y-3">
                    <h2 className="text-2xl text-white text-glow">{copy.title}</h2>
                    <p className="text-sm text-white/60 body-text">{description ?? copy.description}</p>
                </div>

                {copy.action && (
                    <Button.Root type="button" variant="primary" size="lg" onClick={onAction} autoFocus>
                        <Button.Text>{copy.action}</Button.Text>
                    </Button.Root>
                )}
            </div>
        </div>
    );
};
