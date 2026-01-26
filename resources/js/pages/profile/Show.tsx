import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { User, UserCircle } from 'lucide-react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
    };
    profile?: {
        id: number;
        full_name?: string;
        avatar_path?: string;
    };
}

export default function ProfileShow({ user, profile }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: profile?.full_name || '',
        avatar: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        if (data.full_name !== undefined) {
            formData.append('full_name', data.full_name || '');
        }
        
        if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }
        
        router.post('/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('avatar', null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Perfil" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Meu Perfil</h1>
                    <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>Atualize suas informações de perfil</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input type="email" value={user.email} disabled />
                                <p className="text-xs text-muted-foreground mt-1">
                                    O email não pode ser alterado
                                </p>
                            </div>

                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                                    Nome Completo
                                </label>
                                <Input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name || ''}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                />
                                <InputError message={errors.full_name} />
                            </div>

                            <div>
                                <label htmlFor="avatar" className="block text-sm font-medium mb-1">
                                    Foto de Perfil
                                </label>
                                {profile?.avatar_path ? (
                                    <div className="mb-2">
                                        <img
                                            src={`/storage/${profile.avatar_path}`}
                                            alt={profile.full_name || user.name}
                                            className="size-24 rounded-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-2 size-24 rounded-full bg-muted flex items-center justify-center">
                                        <UserCircle className="size-12 text-muted-foreground" />
                                    </div>
                                )}
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('avatar', e.target.files?.[0] || null)}
                                />
                                <InputError message={errors.avatar} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
