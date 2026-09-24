'use client';

import React from 'react';
import { DashboardLayout } from '@/components/app/Layout';
import { DashboardSummaryCards } from '@/components/app/DashboardSummaryCards';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="border-b-2 border-white/20 pb-6">
                    <h1 className="text-3xl lg:text-4xl mb-2 text-white">
                        DASHBOARD
                    </h1>
                    <p className="text-sm tech-text text-white/50 tracking-wider">
                        VISÃO GERAL DAS MENSALIDADES DA TURMA
                    </p>
                </div>

                <DashboardSummaryCards />
            </div>
        </DashboardLayout>
    );
}
