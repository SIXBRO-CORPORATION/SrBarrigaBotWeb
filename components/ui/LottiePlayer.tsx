'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
    () => import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
    { ssr: false }
);

interface LottiePlayerProps {
    src: string;
    loop?: boolean;
    className?: string;
    /** Exibido no lugar da animação quando o usuário prefere menos movimento. */
    fallback?: React.ReactNode;
}

export function LottiePlayer({ src, loop = false, className = '', fallback }: LottiePlayerProps) {
    return (
        <>
            <div className={`motion-reduce:hidden ${className}`}>
                <DotLottieReact src={src} autoplay loop={loop} />
            </div>
            <div className="hidden motion-reduce:flex">{fallback}</div>
        </>
    );
}
