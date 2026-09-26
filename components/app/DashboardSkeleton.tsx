import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

function SummaryCardSkeleton() {
    return (
        <div className="bg-[#0A0A0A] border-2 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton.Root chamfer="sm" className="w-10 h-10 shrink-0" />
                <Skeleton.Root className="h-3 w-28" />
            </div>

            <Skeleton.Root className="h-7 w-36 mb-3" />

            <div className="space-y-2">
                <Skeleton.Root className="h-3 w-full max-w-[220px]" />
                <Skeleton.Root className="h-3 w-3/4 max-w-[180px]" />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            role="status"
            aria-label="Carregando resumo do dashboard"
        >
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
        </div>
    );
}
