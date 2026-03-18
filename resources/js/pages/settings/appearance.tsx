import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <AppLayout>
            <Head title="Aparência" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium">Aparência</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Escolha seu tema preferido</p>
                    </div>
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
