import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ConfigBlockSkeletonProps {
    fields: number;
}

function ConfigBlockSkeleton({ fields }: ConfigBlockSkeletonProps) {
    return (
        <div className="relative">
            <div className="absolute -inset-1 bg-white/10 blur-xl" />
            <div className="relative bg-[#0A0A0A] border-2 border-white/20 chamfer p-6 lg:p-8">
                <div className="absolute inset-3 border border-white/10 chamfer-sm pointer-events-none" />

                <div className="relative space-y-6">
                    <div className="flex items-start gap-4 pb-5 border-b border-white/10">
                        <Skeleton.Root chamfer="sm" className="w-11 h-11 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton.Root className="h-4 w-32" />
                            <Skeleton.Root className="h-3 w-56 max-w-full" />
                        </div>
                    </div>

                    <div className="space-y-5">
                        {Array.from({ length: fields }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton.Root className="h-3 w-40" />
                                <Skeleton.Root className="h-11 w-full" />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        <Skeleton.Root className="h-3 w-32" />
                        <Skeleton.Root className="h-10 w-28" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
            role="status"
            aria-label="Carregando configurações"
        >
            <ConfigBlockSkeleton fields={2} />
            <ConfigBlockSkeleton fields={3} />
        </div>
    );
}
