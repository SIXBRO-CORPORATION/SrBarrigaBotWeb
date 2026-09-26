import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function SidebarUserSkeleton() {
    return (
        <div className="flex-1 min-w-0 space-y-2" role="status" aria-label="Carregando usuário">
            <Skeleton.Root className="h-4 w-28" />
            <Skeleton.Root className="h-3 w-36" />
        </div>
    );
}
