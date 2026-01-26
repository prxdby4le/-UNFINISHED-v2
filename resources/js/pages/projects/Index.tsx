import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';
import { useDebounce } from '@/hooks/useDebounce';
import EmptyState from '@/components/EmptyState';
import { Plus, Search, FolderOpen } from 'lucide-react';

interface Props {
    projects: Project[];
    search?: string;
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
            <Head title="Projetos" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight">Projetos</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Organize seus projetos de áudio</p>
                    </div>
                    <Link href="/projects/create">
                        <Button variant="outline" className="border-border/50">
                            <Plus className="size-4" />
                            Novo Projeto
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar projetos..."
                            value={search || ''}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-border/50 bg-card pl-9"
                        />
                    </div>
                </div>

                {projects.length === 0 ? (
                    <EmptyState
                        icon={FolderOpen}
                        title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
                        description={
                            search
                                ? 'Tente buscar com outros termos'
                                : 'Comece criando seu primeiro projeto de áudio'
                        }
                        action={
                            !search
                                ? {
                                      label: 'Criar primeiro projeto',
                                      href: '/projects/create',
                                  }
                                : undefined
                        }
                    />
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <Card className="group cursor-pointer border-border/50 bg-card transition-all hover:border-border">
                                    {project.cover_path && (
                                        <div className="aspect-video overflow-hidden rounded-t-lg">
                                            <img
                                                src={`/storage/${project.cover_path}`}
                                                alt={project.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="space-y-2">
                                        <CardTitle className="text-xl font-light tracking-tight">{project.name}</CardTitle>
                                        {project.description && (
                                            <CardDescription className="line-clamp-2 text-base text-muted-foreground">
                                                {project.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {project.audio_versions_count || 0} versões
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
