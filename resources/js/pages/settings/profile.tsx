import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { UserCircle } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            value={data.name || ''}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email || ''}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">Full Name</Label>

                                        <Input
                                            id="full_name"
                                            className="mt-1 block w-full"
                                            value={data.full_name || ''}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.full_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="avatar">Profile Photo</Label>
                                        
                                        {profile?.avatar_path ? (
                                            <div className="mb-2">
                                                <img
                                                    src={`/storage/${profile.avatar_path}`}
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
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
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
                                            Save
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Saved
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
