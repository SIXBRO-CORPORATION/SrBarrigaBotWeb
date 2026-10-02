import type { Metadata } from "next";
import { Montserrat, Archivo_Black, Michroma } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { WhatsAppProvider } from "@/providers/WhatsAppProvider";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const archivoBlack = Archivo_Black({
    variable: "--font-archivo-black",
    subsets: ["latin"],
    weight: ['400'],
    display: 'swap',
});

const michroma = Michroma({
    variable: "--font-michroma",
    subsets: ["latin"],
    weight: ['400'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: "Sr. Barriga - Whatsapp Bot",
    description: "Cobranças de Mensalidade - Powered by Computaria",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <body className={`${montserrat.variable} ${archivoBlack.variable} ${michroma.variable} antialiased`}>
        <ThemeProvider>
            <ToastProvider>
                <QueryProvider>
                    <AuthProvider>
                        <WhatsAppProvider>
                            {children}
                        </WhatsAppProvider>
                    </AuthProvider>
                </QueryProvider>
            </ToastProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}