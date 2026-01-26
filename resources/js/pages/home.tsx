import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    Music, 
    Folder,
    MessageSquare, 
    Download, 
    Users, 
    Zap,
    ArrowRight,
    PlayCircle
} from 'lucide-react';
import { login, register, dashboard } from '@/routes';
import type { SharedData } from '@/types';

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;

    const features = [
        {
            icon: Folder,
            title: 'Organize your music the way you want',
            description: 'Organize your tracks into projects and folders, which are synced across all your devices.',
        },
        {
            icon: MessageSquare,
            title: 'Share and see who listens',
            description: 'Share links with friends, collaborate, and get notified when someone listens to your tracks.',
        },
        {
            icon: Download,
            title: 'Upload and listen painlessly',
            description: 'Upload directly from anywhere you\'re getting sent music.',
        },
        {
            icon: Users,
            title: 'Work offline',
            description: 'Listen, edit, and organize no matter your internet connection with offline mode.',
        },
        {
            icon: PlayCircle,
            title: 'Record your ideas',
            description: 'Record and nurture your inspiration whenever it strikes.',
        },
        {
            icon: Zap,
            title: 'Update your tracks with new versions',
            description: 'Replace audio for existing tracks and have access to the version history.',
        },
    ];

    return (
        <>
            <Head title="[UNFINISHED] - A sacred place for your work-in-progress music" />
            
            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="border-b border-border/50">
                    <div className="container mx-auto flex h-20 items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Music className="size-6" />
                            <span className="text-lg font-medium tracking-tight">[UNFINISHED]</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button variant="ghost" className="border border-border/50">
                                        Enter App
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href={register()}>
                                        <Button variant="outline" className="border-border/50">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-6 py-32 md:py-48">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-8 text-5xl font-light tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                            A sacred place for your{' '}
                            <span className="font-normal">work-in-progress</span> music
                        </h1>
                        <p className="mb-12 text-xl text-muted-foreground sm:text-2xl">
                            Listen, share, and organize your work-in-progress music.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {isAuthenticated ? (
                                <Link href={dashboard()}>
                                    <Button size="lg" className="min-w-[200px] border border-border/50 bg-foreground text-background hover:bg-foreground/90">
                                        Enter App
                                        <ArrowRight className="ml-2 size-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={register()}>
                                        <Button size="lg" className="min-w-[200px] border border-border/50 bg-foreground text-background hover:bg-foreground/90">
                                            Sign Up
                                            <ArrowRight className="ml-2 size-5" />
                                        </Button>
                                    </Link>
                                    <Link href={login()}>
                                        <Button size="lg" variant="outline" className="min-w-[200px] border-border/50">
                                            Login
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t border-border/50">
                    <div className="container mx-auto px-6 py-32">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-20 grid gap-16 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={index} className="space-y-4">
                                            <div className="inline-flex size-12 items-center justify-center rounded border border-border/50">
                                                <Icon className="size-6" />
                                            </div>
                                            <h3 className="text-2xl font-light tracking-tight">
                                                {feature.title}
                                            </h3>
                                            <p className="text-lg leading-relaxed text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {!isAuthenticated && (
                    <section className="border-t border-border/50">
                        <div className="container mx-auto px-6 py-32">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="mb-8 text-4xl font-light tracking-tight sm:text-5xl">
                                    Take your creative process to the next level
                                </h2>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link href={register()}>
                                        <Button size="lg" className="min-w-[200px] border border-border/50 bg-foreground text-background hover:bg-foreground/90">
                                            Sign Up
                                            <ArrowRight className="ml-2 size-5" />
                                        </Button>
                                    </Link>
                                    <Link href={login()}>
                                        <Button size="lg" variant="outline" className="min-w-[200px] border-border/50">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t border-border/50">
                    <div className="container mx-auto px-6 py-12">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="flex items-center gap-3">
                                <Music className="size-5" />
                                <span className="font-medium">[UNFINISHED]</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} [UNFINISHED]. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
