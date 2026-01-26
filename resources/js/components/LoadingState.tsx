import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProjectCardSkeleton() {
    return (
        <Card>
            <Skeleton className="aspect-video w-full rounded-t-xl" />
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/4" />
            </CardContent>
        </Card>
    );
}

export function AudioVersionSkeleton() {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
            </CardContent>
        </Card>
    );
}

export function FeedbackSkeleton() {
    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    );
}
