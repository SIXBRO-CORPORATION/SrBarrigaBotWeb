'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/app/Layout';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { WhatsAppStatusPanel, type WhatsAppView } from '@/components/app/WhatsAppStatusPanel';
import { WhatsAppChargePanel } from '@/components/app/WhatsAppChargePanel';
import { WhatsAppNextRunCard } from '@/components/app/WhatsAppNextRunCard';
import { WhatsAppQRModal } from '@/components/app/WhatsAppQRModal';
import { useWhatsAppWebSocket } from '@/hooks/useWhatsAppWebSocket';
import { useExecuteCharge } from '@/hooks/useWhatsapp';
import { useToast } from '@/providers/ToastProvider';
import type { ChargeStatus } from '@/types/whatsapp';

// Tempo para o usuário ver a animação de sucesso antes de o modal fechar.
const QR_SUCCESS_CLOSE_DELAY_MS = 1800;

export default function WhatsAppPage() {
    const {
        status,
        qrCode,
        isConnecting,
        isDisconnecting,
        isLoadingInitialStatus,
        isSocketOnline,
        charge,
        connect,
        disconnect,
    } = useWhatsAppWebSocket();

    const executeChargeMutation = useExecuteCharge();
    const { success, error: showError, info, warning } = useToast();
    const previousChargeStatus = React.useRef<ChargeStatus | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
    const [showChargeDialog, setShowChargeDialog] = useState(false);

    const isConnected = status.isConnected;
    const isChargeRunning = charge.status === 'running';
    const view: WhatsAppView = isLoadingInitialStatus
        ? 'loading'
        : !isSocketOnline
          ? 'offline'
          : isConnected
            ? 'connected'
            : 'disconnected';

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
            setShowDisconnectDialog(false);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Erro ao desconectar');
        }
    };

    const handleExecuteCharge = async () => {
        try {
            await executeChargeMutation.mutateAsync();
        } catch {
            // O http-client já exibe o toast de erro desta requisição.
        } finally {
            setShowChargeDialog(false);
        }
    };

    // Ao conectar, o modal mostra a animação de sucesso e só depois fecha.
    React.useEffect(() => {
        if (!isConnected || !showQRModal) return;

        success('WhatsApp conectado com sucesso!');
        const timer = setTimeout(() => setShowQRModal(false), QR_SUCCESS_CLOSE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isConnected, showQRModal, success]);

    React.useEffect(() => {
        const previous = previousChargeStatus.current;
        previousChargeStatus.current = charge.status;

        if (previous !== 'running') return;

        if (charge.status === 'completed') {
            if (charge.total === 0) {
                info('Nenhum aluno a cobrar no momento');
            } else if (charge.failed > 0) {
                warning(`Cobrança concluída: ${charge.sent} enviada(s) e ${charge.failed} com falha`, 8000);
            } else {
                success(`Cobrança concluída: ${charge.sent} mensagem(ns) enviada(s)`);
            }
        } else if (charge.status === 'failed') {
            showError(charge.error || 'Falha ao executar cobrança', 8000);
        }
    }, [charge, info, warning, success, showError]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6">
                    <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                        WHATSAPP
                    </h1>
                    <p className="text-sm tech-text text-white/50 tracking-wider">
                        SISTEMA DE LEMBRETES AUTOMÁTICOS
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <WhatsAppStatusPanel
                        className="lg:col-span-8"
                        view={view}
                        isConnecting={isConnecting}
                        isDisconnecting={isDisconnecting}
                        isChargeRunning={isChargeRunning}
                        onConnect={handleConnect}
                        onOpenQR={() => setShowQRModal(true)}
                        onDisconnect={() => setShowDisconnectDialog(true)}
                    />
                    <WhatsAppNextRunCard className="lg:col-span-4" />
                    <WhatsAppChargePanel
                        className="lg:col-span-12"
                        charge={charge}
                        canRun={view === 'connected'}
                        isStarting={executeChargeMutation.isPending}
                        onRun={() => setShowChargeDialog(true)}
                    />
                </div>
            </div>

            <WhatsAppQRModal
                open={showQRModal}
                onClose={() => setShowQRModal(false)}
                qrCode={qrCode}
                isConnected={isConnected}
            />

            <ConfirmDialog
                open={showDisconnectDialog}
                onClose={() => setShowDisconnectDialog(false)}
                onConfirm={handleDisconnect}
                title="DESCONECTAR WHATSAPP"
                description="Tem certeza que deseja desconectar? O bot não poderá enviar mensagens até que você conecte novamente."
                confirmLabel="DESCONECTAR"
                loading={isDisconnecting}
            />

            <ConfirmDialog
                open={showChargeDialog}
                onClose={() => setShowChargeDialog(false)}
                onConfirm={handleExecuteCharge}
                title="EXECUTAR COBRANÇA"
                description="Isso envia agora as mensagens de cobrança por WhatsApp aos alunos, fora do horário agendado. Deseja continuar?"
                confirmLabel="EXECUTAR AGORA"
                variant="primary"
                loading={executeChargeMutation.isPending}
            />
        </DashboardLayout>
    );
}
