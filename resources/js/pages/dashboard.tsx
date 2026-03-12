import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">Redirecting to projects...</p>
            </div>
        </AppLayout>
    );
}
