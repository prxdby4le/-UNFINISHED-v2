import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <AppLayout>
            <Head title="Appearance" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium">Appearance</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
