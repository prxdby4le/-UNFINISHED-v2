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
    { title: 'Profile', href: edit(), icon: null },
    { title: 'Password', href: editPassword(), icon: null },
    { title: 'Two-Factor', href: show(), icon: null },
    { title: 'Appearance', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-light tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your profile and account settings
                </p>
            </div>

            <nav className="flex gap-1 border-b border-border/40">
                {tabs.map((tab, i) => (
                    <Link
                        key={`${toUrl(tab.href)}-${i}`}
                        href={tab.href}
                        className={cn(
                            'px-4 py-2 text-sm transition-colors',
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
