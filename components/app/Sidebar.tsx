'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePendingPayments } from '@/hooks/usePayments';
import { SidebarUserSkeleton } from '@/components/app/SidebarSkeleton';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, isLoading: isUserLoading, logout } = useAuth();
    const { data: pendingPayments } = usePendingPayments();
    const pendingPaymentsCount = pendingPayments?.length ?? 0;

    const menuItems = [
        {
            name: 'DASHBOARD',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            name: `PAGAMENTOS(${pendingPaymentsCount})`,
            path: '/payments',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            name: 'WHATSAPP',
            path: '/whatsapp',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
        {
            name: 'ALUNOS',
            path: '/students',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path
                        d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"/>
                </svg>

            )
        },
        {
            name: 'COMISSÃO',
            path: '/comittee',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 21v-1a5 5 0 015-5h4a5 5 0 015 5v1M12 3l2.5 2.5L12 8l-2.5-2.5L12 3z" />
                </svg>
            ),
        },
        {
            name: 'CONFIGURAÇÕES',
            path: '/settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 h-full w-72 bg-[#0A0A0A] border-r-2 border-white z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-6 border-b-2 border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-white flex items-center justify-center chamfer-sm">
                                <div className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center chamfer-sm">
                                    <img src="/logo.png" className="w-8 h-8" />
                                </div>
                            </div>

                            <div>
                                <h1 className="text-sm font-bold text-white">
                                    SR. BARRIGA
                                </h1>
                                <p className="text-xs tech-text text-white/40 tracking-wider">
                                    BOT
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="lg:hidden text-white/50 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 border-b-2 border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 border border-white/30 flex items-center justify-center chamfer-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        {isUserLoading ? (
                            <SidebarUserSkeleton />
                        ) : (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white body-text truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-white/40 tech-text truncate">
                                    {user?.email || ''}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3 tech-text text-sm
                                    border-2 transition-all duration-200
                                    ${
                                    isActive(item.path)
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-white border-white/30 hover:border-white hover-glow'
                                }
                                `}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t-2 border-white/20">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 tech-text text-sm
                                   bg-transparent text-white border-2 border-red-500
                                   hover:bg-red-500 hover:text-white transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>SAIR</span>
                    </button>

                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-xs tech-text text-white/30 tracking-widest">
                            © 2025 COMPUTARIA
                        </p>
                        <p className="text-xs body-text text-white/20 mt-1">
                            &gt;_compilando vitórias
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}