import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Icon className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                    {description}
                </p>
                {action && (
                    <Link href={action.href}>
                        <Button>{action.label}</Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
