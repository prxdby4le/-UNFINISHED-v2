import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Pix() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('4contatokleberhenrique@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppHeaderLayout>
            <Head title="Apoie nosso trabalho" />

            <div className="flex w-full flex-col items-center justify-center py-12 md:py-24 fade-in">
                <div className="mb-8 text-center space-y-3">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 border border-white/10 shadow-lg mb-6">
                        <Heart className="size-8 text-rose-500 fill-rose-500/20" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                        Apoie nosso trabalho
                    </h1>
                    <p className="text-muted-foreground w-full max-w-lg mx-auto text-base md:text-lg px-4">
                        Sua contribuição nos ajuda a manter os servidores online e a continuar desenvolvendo novas funcionalidades.
                    </p>
                </div>

                <Card className="max-w-md w-full mx-4 sm:mx-0 glass-strong border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-from)]/5 to-[var(--gradient-to)]/5 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                    <CardHeader className="text-center relative z-10 space-y-1 pb-4">
                        <CardTitle className="text-xl">QR Code do Pix</CardTitle>
                        <CardDescription>Escaneie com o aplicativo do seu banco</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center justify-center p-6 pt-0 relative z-10 gap-8">
                        <div className="bg-white p-4 rounded-xl shadow-inner border border-neutral-200 animate-in zoom-in duration-700">
                            <img
                                src="/pix-qrcode.png"
                                alt="QR Code Pix"
                                className="w-48 h-48 sm:w-56 sm:h-56 rounded-md"
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-sm font-medium text-foreground text-center">Ou utilize a chave Pix (E-mail):</p>
                            <div className="flex w-full items-center justify-between gap-2 bg-black/40 border border-white/10 px-4 py-3 rounded-lg overflow-hidden">
                                <span className="font-mono text-sm text-white/90 truncate select-all flex-1">
                                    contato@seudominio.com.br
                                </span>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 shadow-sm flex-shrink-0 min-w-20"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check className="size-4 mr-1 text-emerald-500" /> : <Copy className="size-4 mr-1" />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
