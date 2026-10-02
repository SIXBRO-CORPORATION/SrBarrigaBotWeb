'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenManager } from '@/utils/token-manager';
import { useToast } from '@/providers/ToastProvider';
import { WhatsAppChargeStatusBar } from '@/components/app/WhatsAppChargeStatusBar';
import type { ChargeProgress, ChargeStatus } from '@/types/whatsapp';

interface WhatsAppStatus {
    isConnected: boolean;
    needsQR: boolean;
}

interface WhatsAppQRData {
    qrCode: string;
}

interface WhatsAppContextData {
    status: WhatsAppStatus;
    qrCode: string | null;
    isConnecting: boolean;
    isDisconnecting: boolean;
    isLoadingInitialStatus: boolean;
    isSocketOnline: boolean;
    charge: ChargeProgress;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    refreshStatus: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextData | null>(null);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
    const { success, error: showError, info, warning } = useToast();

    const [status, setStatus] = useState<WhatsAppStatus>({ isConnected: false, needsQR: false });
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isLoadingInitialStatus, setIsLoadingInitialStatus] = useState(true);
    const [isSocketOnline, setIsSocketOnline] = useState(false);
    const [charge, setCharge] = useState<ChargeProgress>({ status: 'idle', total: 0, sent: 0, failed: 0 });

    const socketRef = useRef<Socket | null>(null);
    const previousChargeStatus = useRef<ChargeStatus | null>(null);

    useEffect(() => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const token = tokenManager.getAccessToken();

        if (!token) {
            setIsLoadingInitialStatus(false);
            return;
        }

        const socket = io(`${API_BASE_URL.replace('/api', '')}/whatsapp`, {
            auth: (cb) => cb({ token: tokenManager.getAccessToken() }),
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => setIsSocketOnline(true));
        socket.on('disconnect', () => setIsSocketOnline(false));

        socket.on('connect_error', () => {
            setIsSocketOnline(false);
            setIsLoadingInitialStatus(false);
        });

        socket.on('whatsapp:status', (data: WhatsAppStatus) => {
            setStatus(data);
            setIsLoadingInitialStatus(false);

            if (data.isConnected) {
                setQrCode(null);
                setIsConnecting(false);
            }
        });

        socket.on('whatsapp:qr', (data: WhatsAppQRData) => {
            setQrCode(data.qrCode);
            setIsLoadingInitialStatus(false);
        });

        socket.on('whatsapp:charge', (data: ChargeProgress) => setCharge(data));

        return () => {
            socket.disconnect();
        };
    }, []);

    // Notificação de conclusão/falha da cobrança, disparada em qualquer página.
    useEffect(() => {
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

    const connect = useCallback(async () => {
        if (!socketRef.current) {
            throw new Error('WebSocket not connected');
        }

        setIsConnecting(true);
        setQrCode(null);

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('whatsapp:connect', (response: any) => {
                if (response.success) {
                    resolve();
                } else {
                    setIsConnecting(false);
                    reject(new Error(response.error || 'Falha ao conectar'));
                }
            });
        });
    }, []);

    const disconnect = useCallback(async () => {
        if (!socketRef.current) {
            throw new Error('WebSocket not connected');
        }

        setIsDisconnecting(true);

        return new Promise<void>((resolve, reject) => {
            socketRef.current!.emit('whatsapp:disconnect', (response: any) => {
                setIsDisconnecting(false);

                if (response.success) {
                    setQrCode(null);
                    resolve();
                } else {
                    reject(new Error(response.error || 'Falha ao desconectar'));
                }
            });
        });
    }, []);

    const refreshStatus = useCallback(() => {
        if (!socketRef.current) return;

        socketRef.current.emit('whatsapp:get-status', (response: any) => {
            setStatus({
                isConnected: response.isConnected,
                needsQR: response.needsQR,
            });
            setIsLoadingInitialStatus(false);

            if (response.qrCode) {
                setQrCode(response.qrCode);
            }
        });
    }, []);

    return (
        <WhatsAppContext.Provider
            value={{
                status,
                qrCode,
                isConnecting,
                isDisconnecting,
                isLoadingInitialStatus,
                isSocketOnline,
                charge,
                connect,
                disconnect,
                refreshStatus,
            }}
        >
            {children}
            <WhatsAppChargeStatusBar charge={charge} />
        </WhatsAppContext.Provider>
    );
}

export function useWhatsAppWebSocket() {
    const context = useContext(WhatsAppContext);

    if (!context) {
        throw new Error('useWhatsAppWebSocket must be used within a WhatsAppProvider');
    }

    return context;
}
