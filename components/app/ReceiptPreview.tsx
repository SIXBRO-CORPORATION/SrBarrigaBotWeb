'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

type ReceiptKind = 'image' | 'pdf' | 'unknown';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function getReceiptKind(url: string): ReceiptKind {
    try {
        const pathname = new URL(url).pathname.toLowerCase();

        if (pathname.endsWith('.pdf')) return 'pdf';
        if (IMAGE_EXTENSIONS.some((extension) => pathname.endsWith(extension))) return 'image';
    } catch {

    }

    return 'unknown';
}

interface ReceiptPreviewProps {
    open: boolean;
    onClose: () => void;
    receiptUrl: string | null;
    subtitle?: string;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export function ReceiptPreview({
    open,
    onClose,
    receiptUrl,
    subtitle,
    onRefresh,
    isRefreshing = false,
}: ReceiptPreviewProps) {
    return (
        <Modal.Root open={open} onClose={onClose} size="xl">
            <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                <div className="relative p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-xl text-white">
                                COMPROVANTE
                            </h2>
                            {subtitle && (
                                <p className="text-xs tech-text text-white/40 tracking-wider mt-1 truncate">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors flex-shrink-0"
                            aria-label="Fechar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="relative p-6 space-y-6">
                    {receiptUrl && (
                        <ReceiptViewer
                            key={receiptUrl}
                            url={receiptUrl}
                            onRefresh={onRefresh}
                            isRefreshing={isRefreshing}
                        />
                    )}

                    <div className="flex gap-3">
                        <Button.Root
                            variant="ghost"
                            size="md"
                            onClick={onClose}
                            className="flex-1"
                        >
                            <Button.Text>FECHAR</Button.Text>
                        </Button.Root>
                        {receiptUrl && (
                            <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 tech-text text-sm px-6 py-3 border-2 border-white text-white text-center hover-glow-accent hover:bg-white hover:text-black transition-all duration-200"
                            >
                                ABRIR EM NOVA ABA
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </Modal.Root>
    );
}

interface ReceiptViewerProps {
    url: string;
    onRefresh: () => void;
    isRefreshing: boolean;
}

function ReceiptViewer({ url, onRefresh, isRefreshing }: ReceiptViewerProps) {
    const kind = getReceiptKind(url);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="bg-white/5 border-2 border-red-500/50 p-8 text-center space-y-4">
                <div className="space-y-2">
                    <p className="text-white body-text">
                        Não foi possível exibir o comprovante.
                    </p>
                    <p className="text-xs text-white/50 body-text">
                        O link pode ter expirado. Tente novamente para gerar um link novo
                        ou abra o arquivo em uma nova aba.
                    </p>
                </div>
                <Button.Root
                    variant="secondary"
                    size="md"
                    onClick={onRefresh}
                    loading={isRefreshing}
                    disabled={isRefreshing}
                >
                    <Button.Text>TENTAR NOVAMENTE</Button.Text>
                </Button.Root>
            </div>
        );
    }

    return (
        <div className="relative bg-white/5 border border-white/20 min-h-48 flex items-center justify-center">
            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Loading.Root size="lg" />
                    <p className="text-white/70 body-text">Carregando comprovante...</p>
                </div>
            )}

            {kind === 'pdf' ? (
                <iframe
                    src={url}
                    title="Comprovante de pagamento"
                    className="w-full h-[65vh] bg-white"
                    onLoad={() => setIsLoaded(true)}
                />
            ) : (
                <img
                    src={url}
                    alt="Comprovante de pagamento"
                    className={`max-w-full max-h-[65vh] object-contain ${isLoaded ? '' : 'invisible'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                />
            )}
        </div>
    );
}
