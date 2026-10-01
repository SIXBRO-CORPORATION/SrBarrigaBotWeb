'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/providers/ToastProvider';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { error: showError } = useToast();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors: { username?: string; password?: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            newErrors.username = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await login(formData);
        } catch (error) {
            console.log(error instanceof Error ? error.message : 'Erro ao fazer login');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: 'username' | 'password') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading) {
        return <Loading.Screen message="Carregando..." />;
    }

    return (
        <main className="apple-login">
            <div className="apple-card">
                <header className="apple-card__header">
                    <div className="apple-logo">
                        <img alt="Logo Computaria" src="/logo.png" className="apple-logo__img" />
                    </div>

                    <h1 className="apple-title">Sr. Barriga Bot</h1>

                    <p className="apple-subtitle">
                        Entre para gerenciar os lembretes de pagamento.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="apple-form">
                    <Input.Root
                        appearance="apple"
                        id="login-email"
                        type="email"
                        label="E-mail"
                        placeholder="computariabot@gmail.com"
                        value={formData.username}
                        onChange={handleChange('username')}
                        error={errors.username}
                        disabled={isSubmitting}
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                    />

                    <Input.Root
                        appearance="apple"
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Senha"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={handleChange('password')}
                        error={errors.password}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        endAdornment={
                            <button
                                type="button"
                                className="apple-icon-button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        }
                    />

                    <Button.Root
                        type="submit"
                        variant="apple"
                        size="lg"
                        className="w-full"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        <Button.Text>Entrar</Button.Text>
                    </Button.Root>
                </form>

                <footer className="apple-footer">
                    <p>
                        Powered by <span className="apple-footer__brand">Computaria</span>
                    </p>
                    <p>© 2025 Computaria · &gt;_compilando vitórias</p>
                </footer>
            </div>
        </main>
    );
}