import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        cover: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/projects', { forceFormData: true });
    };

    return (
        <AppLayout>
            <Head title="Novo Projeto" />
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-light tracking-tight">Novo Projeto</h1>

                <form onSubmit={submit} className="max-w-md space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium">
                            Nome
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
                            Descrição
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
                            Capa
                        </label>
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
                            {processing ? 'Criando...' : 'Criar'}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
