import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { ReactNode } from 'react';

export default ({ children }: { children: ReactNode }) => (
    <AppSidebarLayout>{children}</AppSidebarLayout>
);
