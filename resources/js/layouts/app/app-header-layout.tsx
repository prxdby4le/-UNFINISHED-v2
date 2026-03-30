import { Link, usePage } from '@inertiajs/react';
import { Music, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { Toast } from '@/components/Toast';
import { useInitials } from '@/hooks/use-initials';
import type { SharedData } from '@/types';
import type { ReactNode } from 'react';

export default function AppHeaderLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full flex-col bg-gradient-mesh">
            {/* Header with glass effect */}
            <header className="sticky top-0 z-40 glass-strong">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link href="/projects" className="group flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-sm transition-shadow group-hover:glow-primary-sm">
                            <Music className="size-3.5 text-white" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">[UNFINISHED]</span>
                    </Link>

                    <nav className="hidden items-center gap-6 sm:flex">
                        <Link
                            href="/projects"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Projetos
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 h-8 glass hover:bg-white/10 transition-all font-medium text-white/90" asChild>
                            <Link href="/support/pix">
                                <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
                                <span>Apoie nosso trabalho</span>
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                    <Avatar className="size-8 ring-1 ring-white/10">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] text-xs text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-strong rounded-xl">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 sm:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </Button>
                    </div>
                </div>

                {/* Gradient accent line under header */}
                <div className="gradient-line w-full" />

                {mobileOpen && (
                    <div className="border-t border-white/5 px-6 py-3 sm:hidden flex flex-col gap-2">
                        <Link
                            href="/projects"
                            className="block py-2 text-sm text-muted-foreground hover:text-white transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Projetos
                        </Link>
                        <Link
                            href="/support/pix"
                            className="flex items-center gap-2 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Heart className="size-4 fill-rose-500/20" />
                            Apoie nosso trabalho
                        </Link>
                    </div>
                )}
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-28 sm:px-6 sm:pt-8 sm:pb-28 fade-in">
                {children}
            </main>

            <Toast />
        </div>
    );
}
