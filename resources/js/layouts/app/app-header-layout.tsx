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
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
                    <Link href="/projects" className="flex items-center gap-2">
                        <Music className="size-4" />
                        <span className="text-sm font-medium tracking-tight">[UNFINISHED]</span>
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
                                    <Avatar className="size-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-muted text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
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

                {mobileOpen && (
                    <div className="border-t border-border/40 px-6 py-3 sm:hidden">
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

            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8 pb-24">
                {children}
            </main>

            <Toast />
        </div>
    );
}
