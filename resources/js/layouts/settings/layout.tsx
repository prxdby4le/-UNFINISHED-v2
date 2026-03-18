import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Toast } from '@/components/Toast';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';

const tabs: NavItem[] = [
    { title: 'Perfil', href: edit(), icon: null },
    { title: 'Senha', href: editPassword(), icon: null },
    { title: 'Dois Fatores', href: show(), icon: null },
    { title: 'Aparência', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-light tracking-tight">Configurações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gerencie seu perfil e configurações da conta
                </p>
            </div>

            <nav className="flex gap-1 border-b border-border/40 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {tabs.map((tab, i) => (
                    <Link
                        key={`${toUrl(tab.href)}-${i}`}
                        href={tab.href}
                        className={cn(
                            'whitespace-nowrap px-3 py-2 text-sm transition-colors sm:px-4',
                            isCurrentUrl(tab.href)
                                ? 'border-b-2 border-foreground font-medium text-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {tab.title}
                    </Link>
                ))}
            </nav>

            <div className="max-w-xl space-y-8">{children}</div>
            <Toast />
        </div>
    );
}
