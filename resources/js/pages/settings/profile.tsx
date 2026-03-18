import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { send } from '@/routes/verification';
import { UserCircle } from 'lucide-react';
import type { SharedData } from '@/types';
import { FormEventHandler } from 'react';

export default function Profile({
    mustVerifyEmail,
    status,
    profile,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    profile?: {
        id: number;
        full_name?: string;
        avatar_path?: string;
        avatar_url?: string;
    };
}) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        full_name: profile?.full_name || '',
        avatar: null as File | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        formData.append('name', data.name || '');
        formData.append('email', data.email || '');
        if (data.full_name !== undefined) {
            formData.append('full_name', data.full_name || '');
        }
        if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }
        
        formData.append('_method', 'PATCH');
        router.post('/settings/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('avatar', null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Configurações de perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium">Informações do perfil</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Atualize seu nome e endereço de e-mail</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            value={data.name || ''}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Nome completo"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">E-mail</Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email || ''}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="E-mail"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">Nome Completo</Label>

                                        <Input
                                            id="full_name"
                                            className="mt-1 block w-full"
                                            value={data.full_name || ''}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            autoComplete="name"
                                            placeholder="Nome completo"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.full_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="avatar">Foto do Perfil</Label>
                                        
                                        {profile?.avatar_path ? (
                                            <div className="mb-2">
                                                <img
                                                    src={profile.avatar_url || `/storage/${profile.avatar_path}`}
                                                    alt={profile.full_name || auth.user.name}
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

                                        <InputError
                                            className="mt-2"
                                            message={errors.avatar}
                                        />
                                    </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Seu endereço de e-mail não está
                                                verificado.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Clique aqui para reenviar o
                                                    e-mail de verificação.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Um novo link de verificação
                                                    foi enviado para seu e-mail.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-profile-button"
                                        >
                                            Salvar
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Salvo
                                            </p>
                                        </Transition>
                                    </div>
                                </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
