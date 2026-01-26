import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { projectRepository } from '@/repositories/projectRepository';

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        cover: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/projects', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Criar Projeto" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-6">
                <div>
                    <h1 className="text-4xl font-light tracking-tight">Criar Novo Projeto</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Adicione um novo projeto de áudio</p>
                </div>

                <Card className="border-border/50 bg-card">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-light tracking-tight">Informações do Projeto</CardTitle>
                        <CardDescription className="text-base">Preencha os dados do projeto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Nome do Projeto *
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name || ''}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="border-border/50 bg-card"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description || ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div>
                                <label htmlFor="cover" className="block text-sm font-medium mb-1">
                                    Capa do Projeto
                                </label>
                                <Input
                                    id="cover"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('cover', e.target.files?.[0] || null)}
                                />
                                <InputError message={errors.cover} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Projeto'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
