import { Link, usePage } from '@inertiajs/react';
import { Music, Menu, X } from 'lucide-react';
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
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
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
                            Projects
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
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
                    <div className="border-t border-white/5 px-6 py-3 sm:hidden">
                        <Link
                            href="/projects"
                            className="block py-2 text-sm text-muted-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            Projects
                        </Link>
                    </div>
                )}
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 pb-24 fade-in">
                {children}
            </main>

            <Toast />
        </div>
    );
}
