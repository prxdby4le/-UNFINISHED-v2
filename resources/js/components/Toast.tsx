import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { useState } from 'react';

// Hook to safely get page props
function useSafePage() {
    try {
        return usePage();
    } catch (error) {
        return null;
    }
}

export function Toast() {
    const page = useSafePage();
    const flash = page ? (page.props as any)?.flash : null;

    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<'success' | 'error' | 'info'>('success');

    useEffect(() => {
        if (!flash) return;

        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        }
    }, [flash]);

    if (!visible || !message) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
            <Alert variant={type} className="min-w-[300px]">
                <AlertDescription className="flex items-center justify-between">
                    <span>{message}</span>
                    <button
                        onClick={() => setVisible(false)}
                        className="ml-4 hover:opacity-70"
                    >
                        <X className="size-4" />
                    </button>
                </AlertDescription>
            </Alert>
        </div>
    );
}
