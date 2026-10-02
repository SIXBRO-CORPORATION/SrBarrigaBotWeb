import React from 'react';

export type PanelAccent = 'default' | 'success' | 'danger' | 'warning';

export const PANEL_ACCENT: Record<
    PanelAccent,
    { frame: string; text: string; border: string; tint: string; stroke: string }
> = {
    default: { frame: 'bg-white/20', text: 'text-white', border: 'border-white/30', tint: 'bg-white/10', stroke: 'stroke-white' },
    success: { frame: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', tint: 'bg-green-500/10', stroke: 'stroke-green-500' },
    danger: { frame: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', tint: 'bg-red-500/10', stroke: 'stroke-red-500' },
    warning: { frame: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-400', tint: 'bg-amber-400/10', stroke: 'stroke-amber-400' },
};

interface PanelProps {
    accent?: PanelAccent;
    delay?: number;
    className?: string;
    children: React.ReactNode;
}

export function Panel({ accent = 'default', delay = 0, className = '', children }: PanelProps) {
    return (
        <div
            className={`chamfer p-[2px] ${PANEL_ACCENT[accent].frame} animate-fade-in ${className}`}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div className="chamfer relative h-full overflow-hidden bg-[#0A0A0A] p-6">{children}</div>
        </div>
    );
}

interface PanelTitleProps {
    icon: string;
    children: React.ReactNode;
}

export function PanelTitle({ icon, children }: PanelTitleProps) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 shrink-0 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d={icon} />
                </svg>
            </div>
            <h3 className="text-sm tech-text text-white/70 tracking-wider">{children}</h3>
        </div>
    );
}
