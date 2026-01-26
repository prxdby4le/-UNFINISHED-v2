import { Music } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <Music className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-sm font-medium tracking-tight">
                    [UNFINISHED]
                </span>
            </div>
        </>
    );
}
