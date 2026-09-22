import React from 'react';

interface TableRootProps {
    children: React.ReactNode;
    className?: string;
}

const TableRoot: React.FC<TableRootProps> = ({ children, className = '' }) => {
    return (
        <div className={`w-full overflow-x-auto border-2 border-white/30 ${className}`}>
            <table className="w-full border-collapse text-left">
                {children}
            </table>
        </div>
    );
};

interface TableHeaderProps {
    children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
    return (
        <thead className="bg-white/5 border-b-2 border-white/30">
            {children}
        </thead>
    );
};

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => {
    return (
        <tr
            onClick={onClick}
            className={`
                border-b border-white/10 transition-colors duration-200
                ${onClick ? 'cursor-pointer hover:bg-white/5' : ''}
                ${className}
            `}
        >
            {children}
        </tr>
    );
};

interface TableCellProps {
    children?: React.ReactNode;
    as?: 'td' | 'th';
    className?: string;
    colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({ children, as = 'td', className = '', colSpan }) => {
    const Tag = as;

    const baseStyles = as === 'th'
        ? 'px-4 py-3 text-xs tech-text text-white/60 tracking-wider uppercase'
        : 'px-4 py-3 text-sm text-white body-text';

    return (
        <Tag colSpan={colSpan} className={`${baseStyles} ${className}`}>
            {children}
        </Tag>
    );
};

export const Table = {
    Root: TableRoot,
    Header: TableHeader,
    Row: TableRow,
    Cell: TableCell,
};
