import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Music, ArrowRight } from 'lucide-react';
import { login, register, dashboard } from '@/routes';
import type { SharedData } from '@/types';

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;

    return (
        <>
            <Head title="[UNFINISHED] — Um lugar sagrado para suas músicas em progresso" />

            <div className="relative flex min-h-screen flex-col bg-gradient-mesh text-foreground overflow-hidden">
                {/* Floating background orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="float-orb absolute -left-40 top-1/3 size-80 rounded-full bg-[oklch(0.55_0.25_280_/_0.10)] blur-3xl" />
                    <div className="float-orb absolute -right-40 top-1/4 size-96 rounded-full bg-[oklch(0.50_0.22_240_/_0.08)] blur-3xl" style={{ animationDelay: '-5s' }} />
                    <div className="float-orb absolute left-1/3 -bottom-20 size-72 rounded-full bg-[oklch(0.55_0.28_320_/_0.08)] blur-3xl" style={{ animationDelay: '-10s' }} />
                </div>

                {/* Glass header */}
                <header className="relative z-10 glass-strong">
                    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-sm">
                                <Music className="size-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">[UNFINISHED]</span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button variant="ghost" size="sm" className="text-sm">
                                        Entrar
                                        <ArrowRight className="ml-1.5 size-3.5" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href={register()}>
                                        <Button size="sm" className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white border-0 shadow-lg hover:opacity-90 transition-opacity">
                                            Criar Conta
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                    <div className="gradient-line w-full" />
                </header>

                {/* Hero */}
                <section className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6">
                    <div className="mx-auto max-w-3xl text-center float-up">
                        <h1 className="text-3xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Um lugar sagrado para suas{' '}
                            <span className="font-normal gradient-text">músicas em progresso</span>
                        </h1>
                        <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto sm:mt-6 sm:text-lg">
                            Armazene, organize e ouça suas músicas em qualidade lossless com reprodução contínua.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button size="lg" className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white border-0 shadow-lg hover:shadow-xl hover:glow-primary-sm transition-all px-8">
                                        Entrar
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={register()}>
                                        <Button size="lg" className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white border-0 shadow-lg hover:shadow-xl hover:glow-primary-sm transition-all px-8">
                                            Começar
                                            <ArrowRight className="ml-2 size-4" />
                                        </Button>
                                    </Link>
                                    <Link href={login()}>
                                        <Button size="lg" variant="ghost" className="text-muted-foreground">
                                            Login
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 px-4 py-6 sm:px-6">
                    <div className="gradient-line w-full mb-6" />
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} [UNFINISHED]
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
