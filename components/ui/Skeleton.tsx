import React from 'react';

interface SkeletonRootProps extends React.HTMLAttributes<HTMLDivElement> {
    chamfer?: 'none' | 'sm' | 'default';
}

const SkeletonRoot: React.FC<SkeletonRootProps> = ({ className = '', chamfer = 'none', ...props }) => {
    const chamferClass = chamfer === 'sm' ? 'chamfer-sm' : chamfer === 'default' ? 'chamfer' : '';

    return (
        <div
            aria-hidden="true"
            className={`skeleton ${chamferClass} ${className}`}
            {...props}
        />
    );
};

export const Skeleton = {
    Root: SkeletonRoot,
};
