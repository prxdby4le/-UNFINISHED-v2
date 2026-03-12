import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';

interface Props {
    project: Project;
}

export default function ProjectsEdit({ project }: Props) {
    const { data, setData, processing, errors } = useForm({
        name: project.name || '',
        description: project.description || '',
        cover: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', data.name || '');
        if (data.description !== undefined && data.description !== null) {
            formData.append('description', data.description || '');
        }
        if (data.cover instanceof File) formData.append('cover', data.cover);
        formData.append('_method', 'PUT');

        router.post(`/projects/${project.id}`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('cover', null);
                router.reload({ only: ['project'] });
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit: ${project.name}`} />
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-light tracking-tight">Edit Project</h1>

                <form onSubmit={submit} className="max-w-md space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="name"
                            value={data.name || ''}
                            onChange={(e) => setData('name', e.target.value)}
                            className="border-border/40"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <label htmlFor="description" className="mb-1 block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-border focus:outline-none"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div>
                        <label htmlFor="cover" className="mb-1 block text-sm font-medium">
                            Cover art
                        </label>
                        {project.cover_path && (
                            <img
                                src={`/storage/${project.cover_path}`}
                                alt={project.name}
                                className="mb-2 size-24 rounded-lg object-cover"
                            />
                        )}
                        <Input
                            id="cover"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('cover', e.target.files?.[0] || null)}
                            className="border-border/40"
                        />
                        <InputError message={errors.cover} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
