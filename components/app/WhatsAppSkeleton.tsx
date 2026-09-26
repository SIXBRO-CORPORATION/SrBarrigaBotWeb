import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function WhatsAppStatusBadgeSkeleton() {
    return (
        <div
            className="px-4 py-2 border-2 border-white/10 bg-white/5"
            role="status"
            aria-label="Carregando status da conexão"
        >
            <div className="flex items-center gap-2">
                <Skeleton.Root className="w-2 h-2 shrink-0" />
                <Skeleton.Root className="h-3 w-24" />
            </div>
        </div>
    );
}

export function WhatsAppStatusBodySkeleton() {
    return (
        <div
            className="space-y-4"
            role="status"
            aria-label="Carregando status da conexão"
        >
            <div className="flex items-start gap-3">
                <Skeleton.Root className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                    <Skeleton.Root className="h-4 w-64 max-w-full" />
                    <Skeleton.Root className="h-3 w-48 max-w-full" />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Skeleton.Root className="h-10 w-56" />
                <Skeleton.Root className="h-10 w-40" />
            </div>
        </div>
    );
}

export function WhatsAppAutomationValueSkeleton() {
    return (
        <>
            <Skeleton.Root className="h-7 w-16" />
            <Skeleton.Root className="h-3 w-28 mt-2" />
        </>
    );
}
