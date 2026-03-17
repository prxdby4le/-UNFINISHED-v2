import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Toast } from '@/components/Toast';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-mesh-auth p-6 md:p-10 overflow-hidden">
            {/* Floating orbs for visual depth */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="float-orb absolute -left-32 top-1/4 size-64 rounded-full bg-[oklch(0.55_0.25_280_/_0.08)] blur-3xl" />
                <div className="float-orb absolute -right-32 top-2/3 size-72 rounded-full bg-[oklch(0.55_0.28_320_/_0.06)] blur-3xl" style={{ animationDelay: '-7s' }} />
                <div className="float-orb absolute left-1/2 -top-20 size-48 rounded-full bg-[oklch(0.50_0.22_240_/_0.07)] blur-3xl" style={{ animationDelay: '-13s' }} />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="glass-card rounded-2xl p-8 float-up">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-lg">
                                    <AppLogoIcon className="size-5 fill-current text-white" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium">{title}</h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <Toast />
        </div>
    );
}
