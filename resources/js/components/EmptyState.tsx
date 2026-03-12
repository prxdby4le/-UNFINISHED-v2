import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Icon className="size-8 text-muted-foreground/30" />
            <h3 className="mt-4 text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            {action && (
                <Link href={action.href} className="mt-4">
                    <Button variant="outline" size="sm">{action.label}</Button>
                </Link>
            )}
        </div>
    );
}
