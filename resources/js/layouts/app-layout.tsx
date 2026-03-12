import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { ReactNode } from 'react';

export default ({ children }: { children: ReactNode }) => (
    <AppHeaderLayout>{children}</AppHeaderLayout>
);
