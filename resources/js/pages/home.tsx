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
            <Head title="[UNFINISHED] — A sacred place for your work-in-progress music" />

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="border-b border-border/30">
                    <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <Music className="size-4" />
                            <span className="text-sm font-medium tracking-tight">[UNFINISHED]</span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button variant="ghost" size="sm" className="text-sm">
                                        Enter App
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
                                        <Button variant="outline" size="sm">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <section className="flex flex-1 items-center justify-center px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-5xl font-light tracking-tight sm:text-6xl md:text-7xl">
                            A sacred place for your{' '}
                            <span className="font-normal">work-in-progress</span> music
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                            Store, organize, and listen to your music in lossless quality with gapless playback.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                                        Enter App
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={register()}>
                                        <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                                            Get Started
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

                <footer className="border-t border-border/30 px-6 py-6">
                    <div className="mx-auto flex max-w-4xl items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} [UNFINISHED]
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
