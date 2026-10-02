import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

function PanelSkeleton({ className = '', children }: { className?: string; children: React.ReactNode }) {
    return <div className={`bg-[#0A0A0A] border-2 border-white/10 p-6 ${className}`}>{children}</div>;
}

function SmallPanelSkeleton() {
    return (
        <PanelSkeleton className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton.Root chamfer="sm" className="w-10 h-10 shrink-0" />
                <Skeleton.Root className="h-3 w-28" />
            </div>
            <Skeleton.Root className="h-7 w-36 mb-3" />
            <Skeleton.Root className="h-3 w-full max-w-[200px]" />
        </PanelSkeleton>
    );
}

export function DashboardSkeleton() {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            role="status"
            aria-label="Carregando resumo do dashboard"
        >
            <PanelSkeleton className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton.Root chamfer="sm" className="w-10 h-10 shrink-0" />
                    <Skeleton.Root className="h-3 w-32" />
                </div>
                <Skeleton.Root className="h-12 w-72 max-w-full mb-3" />
                <Skeleton.Root className="h-3 w-44 mb-8" />
                <Skeleton.Root chamfer="sm" className="h-3 w-full" />
            </PanelSkeleton>

            <SmallPanelSkeleton />
            <SmallPanelSkeleton />
            <SmallPanelSkeleton />
            <SmallPanelSkeleton />
        </div>
    );
}
