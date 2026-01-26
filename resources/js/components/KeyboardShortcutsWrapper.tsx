import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsWrapper({ children }: { children: React.ReactNode }) {
    useKeyboardShortcuts();
    return <>{children}</>;
}
