'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/app/Layout';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useWhatsAppWebSocket } from '@/hooks/useWhatsAppWebSocket';
import { useExecuteCharge } from '@/hooks/useWhatsapp';
import { useToast } from '@/providers/ToastProvider';
import QRCode from 'react-qr-code';

export default function WhatsAppPage() {
    const {
        status,
        qrCode,
        isConnecting,
        isDisconnecting,
        isLoadingInitialStatus,
        connect,
        disconnect
    } = useWhatsAppWebSocket();

    const executeChargeMutation = useExecuteCharge();
    const { success, error: showError } = useToast();
    const [showQRModal, setShowQRModal] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);

    const handleConnect = async () => {
        try {
            setShowQRModal(true);
            await connect();
        } catch (error) {
            setShowQRModal(false);
            showError(error instanceof Error ? error.message : 'Erro ao iniciar conexão');
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            success('WhatsApp desconectado com sucesso');
            setShowDisconnectModal(false);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Erro ao desconectar');
        }
    };

    const handleExecuteCharge = async () => {
        try {
            await executeChargeMutation.mutateAsync();
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao executar cobrança');
        }
    };

    const handleCloseQRModal = () => {
        setShowQRModal(false);
    };

    React.useEffect(() => {
        if (status.isConnected && showQRModal) {
            success('WhatsApp conectado com sucesso!');
            handleCloseQRModal();
        }
    }, [status.isConnected, showQRModal]);

    const isConnected = status.isConnected;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="border-b-2 border-white/20 pb-6">
                    <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                        WHATSAPP
                    </h1>
                    <p className="text-sm tech-text text-white/50 tracking-wider">
                        SISTEMA DE LEMBRETES AUTOMÁTICOS
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute -inset-1 bg-white/10 blur-xl" />
                    <div className="relative bg-[#0A0A0A] border-2 border-white chamfer p-6">
                        <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl mb-2 text-white">
                                        STATUS DA CONEXÃO
                                    </h2>
                                    <p className="text-xs tech-text text-white/40 tracking-wider">
                                        WHATSAPP BOT • TEMPO REAL
                                    </p>
                                </div>

                                {isLoadingInitialStatus ? (
                                    <div className="px-4 py-2 border-2 border-white/30 bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-white/40 animate-pulse-soft" />
                                            <span className="text-xs tech-text tracking-wider text-white/60">
                                                CARREGANDO...
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 border-2 ${
                                        isConnected
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-red-500 bg-red-500/10'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 ${
                                                isConnected ? 'bg-green-500' : 'bg-red-500'
                                            } animate-pulse-soft`} />
                                            <span className={`text-xs tech-text tracking-wider ${
                                                isConnected ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                                {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/10 mb-6" />

                            {isLoadingInitialStatus ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                                            <Loading.Root size="sm" variant="spinner" />
                                        </div>
                                        <div>
                                            <p className="text-white body-text mb-1">
                                                Verificando status da conexão...
                                            </p>
                                            <p className="text-xs text-white/50 body-text">
                                                Aguarde enquanto sincronizamos com o servidor
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : isConnected ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-white body-text mb-1">
                                                Sessão ativa do WhatsApp detectada
                                            </p>
                                            <p className="text-xs text-white/50 body-text">
                                                O bot está pronto para enviar mensagens automáticas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button.Root
                                            variant="primary"
                                            size="md"
                                            onClick={handleExecuteCharge}
                                            loading={executeChargeMutation.isPending}
                                            disabled={executeChargeMutation.isPending}
                                        >
                                            <Button.Icon>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </Button.Icon>
                                            <Button.Text>EXECUTAR COBRANÇA AGORA</Button.Text>
                                        </Button.Root>

                                        <Button.Root
                                            variant="danger"
                                            size="md"
                                            onClick={() => setShowDisconnectModal(true)}
                                            disabled={isDisconnecting}
                                        >
                                            <Button.Icon>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Button.Icon>
                                            <Button.Text>DESCONECTAR</Button.Text>
                                        </Button.Root>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-white body-text mb-1">
                                                Nenhuma sessão ativa encontrada
                                            </p>
                                            <p className="text-xs text-white/50 body-text">
                                                Conecte seu WhatsApp para ativar o bot de lembretes
                                            </p>
                                        </div>
                                    </div>

                                    <Button.Root
                                        variant="primary"
                                        size="md"
                                        onClick={handleConnect}
                                        loading={isConnecting}
                                        disabled={isConnecting}
                                    >
                                        <Button.Icon>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </Button.Icon>
                                        <Button.Text>CONECTAR WHATSAPP</Button.Text>
                                    </Button.Root>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm tech-text text-white/70 tracking-wider">
                                PRÓXIMA EXECUÇÃO
                            </h3>
                        </div>
                        <p className="text-2xl text-white body-text">
                            01/06 às 08:40
                        </p>
                        <p className="text-xs text-white/40 mt-1 body-text">
                            Dia 01 de cada mês
                        </p>
                    </div>

                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm tech-text text-white/70 tracking-wider">
                                PLANILHA
                            </h3>
                        </div>
                        <p className="text-2xl text-white body-text">
                            Google Sheets
                        </p>
                        <p className="text-xs text-white/40 mt-1 body-text">
                            Sincronizada
                        </p>
                    </div>

                    <div className="bg-[#0A0A0A] border-2 border-white/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm tech-text text-white/70 tracking-wider">
                                AUTOMAÇÃO
                            </h3>
                        </div>
                        <p className="text-2xl text-white body-text">
                            {isLoadingInitialStatus ? <Loading.Root size="lg" variant="minimal" /> : (isConnected ? 'Ativa' : 'Inativa')}
                        </p>
                        <p className="text-xs text-white/40 mt-1 body-text">
                            {isLoadingInitialStatus ? 'Verificando...' : (isConnected ? 'Sistema operacional' : 'Aguardando conexão')}
                        </p>
                    </div>
                </div>
            </div>

            <Modal.Root open={showQRModal} onClose={handleCloseQRModal} size="md">
                <div className="bg-[#0A0A0A] border-2 border-white chamfer overflow-hidden">
                    <div className="absolute inset-3 border border-white/20 chamfer-sm pointer-events-none" />

                    <div className="relative p-6 border-b-2 border-white/20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl text-white">
                                CONECTAR WHATSAPP
                            </h2>
                            <button
                                onClick={handleCloseQRModal}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="relative p-8">
                        <div className="flex flex-col items-center">
                            {isConnecting && !qrCode && (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <Loading.Root size="lg" />
                                    <p className="text-white/70 body-text text-center">
                                        Gerando QR Code...
                                    </p>
                                </div>
                            )}

                            {qrCode && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 chamfer-sm">
                                        <QRCode
                                            value={qrCode}
                                            size={256}
                                            level="H"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-white body-text text-center">
                                            Escaneie o QR Code com seu WhatsApp
                                        </p>
                                        <div className="bg-white/5 border border-white/20 p-4 space-y-2">
                                            <p className="text-xs text-white/60 body-text">
                                                1. Abra o WhatsApp no seu celular
                                            </p>
                                            <p className="text-xs text-white/60 body-text">
                                                2. Vá em Configurações → Aparelhos conectados
                                            </p>
                                            <p className="text-xs text-white/60 body-text">
                                                3. Toque em "Conectar um aparelho"
                                            </p>
                                            <p className="text-xs text-white/60 body-text">
                                                4. Aponte para este QR Code
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status.isConnected && (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 flex items-center justify-center chamfer">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-green-500 body-text text-lg">
                                        Conectado com sucesso!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Root>

            <Modal.Root open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} size="sm">
                <div className="bg-[#0A0A0A] border-2 border-red-500 chamfer overflow-hidden">
                    <div className="absolute inset-3 border border-red-500/20 chamfer-sm pointer-events-none" />

                    <div className="relative p-6 border-b-2 border-red-500/20">
                        <h2 className="text-xl text-white">
                            DESCONECTAR WHATSAPP
                        </h2>
                    </div>

                    <div className="relative p-6">
                        <div className="flex items-start gap-3 mb-6">
                            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-white body-text mb-2">
                                    Tem certeza que deseja desconectar?
                                </p>
                                <p className="text-sm text-white/60 body-text">
                                    O bot não poderá enviar mensagens até que você conecte novamente.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button.Root
                                variant="ghost"
                                size="md"
                                onClick={() => setShowDisconnectModal(false)}
                                className="flex-1"
                            >
                                <Button.Text>CANCELAR</Button.Text>
                            </Button.Root>
                            <Button.Root
                                variant="danger"
                                size="md"
                                onClick={handleDisconnect}
                                loading={isDisconnecting}
                                disabled={isDisconnecting}
                                className="flex-1"
                            >
                                <Button.Text>DESCONECTAR</Button.Text>
                            </Button.Root>
                        </div>
                    </div>
                </div>
            </Modal.Root>
        </DashboardLayout>
    );
}