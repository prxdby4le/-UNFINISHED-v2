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
                <div className="flex items-center justify-between float-up">
                    <h1 className="text-2xl font-light tracking-tight">Projects</h1>
                    <Link
                        href="/projects/create"
                        className="flex size-9 items-center justify-center rounded-xl glass text-muted-foreground transition-all hover:text-foreground hover:glow-primary-sm"
                    >
                        <Plus className="size-4" />
                    </Link>
                </div>

                <div className="relative float-up" style={{ animationDelay: '0.1s' }}>
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search projects..."
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input pl-9 rounded-xl"
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
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {projects.map((project, index) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className={`group flex flex-col gap-3 rounded-2xl p-3 transition-all duration-300 float-up
                                    hover:glass hover:scale-[1.03] hover:shadow-xl
                                    border border-transparent hover:border-white/10
                                    stagger-${Math.min(index + 1, 10)}`}
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/50 shadow-sm transition-all group-hover:shadow-lg group-hover:shadow-[var(--glow-color)]">
                                    {project.cover_path ? (
                                        <img
                                            src={`/storage/${project.cover_path}`}
                                            alt={project.name}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--gradient-from)]/5 to-[var(--gradient-to)]/5">
                                            <Music className="size-8 text-muted-foreground/30 transition-all duration-500 group-hover:scale-110 group-hover:text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                                <div className="flex flex-col gap-0.5 px-1">
                                    <p className="truncate text-base font-semibold leading-tight">{project.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {formatCount(project.audio_versions_count || 0)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
