'use client';

import React, { useRef, useState } from 'react';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return 'Formato não suportado. Envie uma imagem (JPG, PNG, WEBP) ou um PDF.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return 'Arquivo muito grande. O tamanho máximo é 10MB.';
    }
    return null;
}

interface FileInputRootProps {
    label?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    disabled?: boolean;
    /** Abre a câmera direto no mobile, em vez de só a galeria. */
    captureEnvironment?: boolean;
}

const FileInputRoot: React.FC<FileInputRootProps> = ({
    label,
    value,
    onChange,
    error,
    disabled = false,
    captureEnvironment = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const displayError = error ?? localError ?? undefined;

    const applyFile = (file: File | null) => {
        if (!file) {
            setLocalError(null);
            onChange(null);
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setLocalError(validationError);
            onChange(null);
            return;
        }

        setLocalError(null);
        onChange(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        applyFile(e.target.files?.[0] ?? null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        applyFile(e.dataTransfer.files?.[0] ?? null);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inputRef.current) inputRef.current.value = '';
        applyFile(null);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs tech-text text-white/70 mb-2 tracking-wider">
                    {label}
                </label>
            )}

            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    flex items-center gap-3 px-4 py-3 border-2 border-dashed
                    transition-colors duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${displayError ? 'border-red-500' : isDragging ? 'border-white' : 'border-white/30 hover:border-white/60'}
                `}
            >
                <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>

                {value ? (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm text-white body-text truncate">{value.name}</p>
                            <p className="text-xs text-white/50">{formatBytes(value.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={disabled}
                            className="text-white/50 hover:text-red-500 transition-colors flex-shrink-0"
                            aria-label="Remover arquivo"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex-1">
                        <p className="text-sm text-white/70 body-text">
                            Clique ou arraste o comprovante (opcional)
                        </p>
                        <p className="text-xs text-white/40">JPG, PNG, WEBP ou PDF — até 10MB</p>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_MIME_TYPES.join(',')}
                    capture={captureEnvironment ? 'environment' : undefined}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                />
            </div>

            {displayError && (
                <p className="mt-2 text-xs text-red-500 body-text flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {displayError}
                </p>
            )}
        </div>
    );
};

export const FileInput = {
    Root: FileInputRoot,
};
