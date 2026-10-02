'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ChargeProgress } from '@/types/whatsapp';

export function WhatsAppChargeStatusBar({ charge }: { charge: ChargeProgress }) {
    const pathname = usePathname();

    if (charge.status !== 'running') return null;

    const done = charge.sent + charge.failed;
    const percent = charge.total > 0 ? Math.min(100, Math.round((done / charge.total) * 100)) : 0;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
            <div className="pointer-events-auto border-2 border-white/20 bg-[#0A0A0A] chamfer-sm overflow-hidden animate-slide-in-up">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-2 h-2 shrink-0 rounded-full bg-[#00D9FF] animate-pulse-soft" />

                    <div className="flex-1 min-w-0">
                        <p className="text-xs tech-text text-white tracking-wider truncate">ENVIANDO COBRANÇAS</p>
                        <p className="text-[11px] text-white/50 body-text">
                            {charge.total > 0 ? `${done} de ${charge.total} processadas` : 'Buscando alunos...'}
                        </p>
                    </div>

                    {pathname !== '/whatsapp' && (
                        <Link
                            href="/whatsapp"
                            className="shrink-0 text-[10px] tech-text text-[#00D9FF] hover:text-white border border-[#00D9FF]/40 hover:border-white px-2 py-1 transition-colors"
                        >
                            VER
                        </Link>
                    )}
                </div>

                <div className="h-1 bg-white/10 overflow-hidden">
                    {charge.total > 0 ? (
                        <div
                            className="h-full bg-[#00D9FF] transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                        />
                    ) : (
                        <div className="h-full w-1/4 bg-[#00D9FF] animate-line-loader" />
                    )}
                </div>
            </div>
        </div>
    );
}
