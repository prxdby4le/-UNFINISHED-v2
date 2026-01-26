import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
    const variants = {
        default: 'bg-background border-border text-foreground',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };

    const icons = {
        default: null,
        success: <CheckCircle2 className="size-4" />,
        error: <XCircle className="size-4" />,
        warning: <AlertCircle className="size-4" />,
        info: <Info className="size-4" />,
    };

    return (
        <div
            className={cn(
                'relative flex items-start gap-3 rounded-lg border p-4',
                variants[variant],
                className
            )}
            {...props}
        >
            {icons[variant] && <div className="mt-0.5">{icons[variant]}</div>}
            <div className="flex-1">{children}</div>
        </div>
    );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h5
            className={cn('mb-1 font-medium leading-none tracking-tight', className)}
            {...props}
        />
    );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <div
            className={cn('text-sm [&_p]:leading-relaxed', className)}
            {...props}
        />
    );
}

export { Alert, AlertTitle, AlertDescription };
