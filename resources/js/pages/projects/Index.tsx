import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';
import { useDebounce } from '@/hooks/useDebounce';
import EmptyState from '@/components/EmptyState';
import { Plus, Search, FolderOpen, Music } from 'lucide-react';

interface Props {
    projects: Project[];
    search?: string;
}

function formatCount(count: number): string {
    return `${count} track${count !== 1 ? 's' : ''}`;
}

export default function ProjectsIndex({ projects, search: initialSearch = '' }: Props) {
    const [search, setSearch] = useState(initialSearch || '');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        if (debouncedSearch !== initialSearch) {
            router.get('/projects', { search: debouncedSearch || undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, [debouncedSearch]);

    return (
        <AppLayout>
            <Head title="Projects" />
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight">Projects</h1>
                    <Link
                        href="/projects/create"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Plus className="size-4" />
                    </Link>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search projects..."
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-border/40 bg-transparent pl-9"
                    />
                </div>

                {projects.length === 0 ? (
                    <EmptyState
                        icon={FolderOpen}
                        title={search ? 'No projects found' : 'No projects yet'}
                        description={
                            search
                                ? 'Try a different search term'
                                : 'Create your first project to get started'
                        }
                        action={
                            !search
                                ? { label: 'Create project', href: '/projects/create' }
                                : undefined
                        }
                    />
                ) : (
                    <div className="divide-y divide-border/40">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="group flex items-center gap-4 py-3 transition-colors hover:bg-muted/30 -mx-3 px-3 rounded-lg"
                            >
                                <div className="flex size-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                    {project.cover_path ? (
                                        <img
                                            src={`/storage/${project.cover_path}`}
                                            alt={project.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <Music className="size-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{project.name}</p>
                                    {project.description && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <span className="flex-shrink-0 text-xs text-muted-foreground">
                                    {formatCount(project.audio_versions_count || 0)}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
