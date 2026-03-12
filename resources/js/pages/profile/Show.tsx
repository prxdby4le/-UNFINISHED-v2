import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { UserCircle } from 'lucide-react';

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
        if (data.full_name !== undefined) formData.append('full_name', data.full_name || '');
        if (data.avatar instanceof File) formData.append('avatar', data.avatar);
        router.post('/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setData('avatar', null),
        });
    };

    return (
        <AppLayout>
            <Head title="Profile" />
            <div className="flex flex-col gap-8">
                <h1 className="text-2xl font-light tracking-tight">Profile</h1>

                <div className="flex items-start gap-6">
                    <div className="flex size-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {profile?.avatar_path ? (
                            <img
                                src={`/storage/${profile.avatar_path}`}
                                alt={profile.full_name || user.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <UserCircle className="size-10 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium">{profile?.full_name || user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="max-w-md space-y-4">
                    <div>
                        <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
                            Full name
                        </label>
                        <Input
                            id="full_name"
                            value={data.full_name || ''}
                            onChange={(e) => setData('full_name', e.target.value)}
                            className="border-border/40"
                        />
                        <InputError message={errors.full_name} />
                    </div>

                    <div>
                        <label htmlFor="avatar" className="mb-1 block text-sm font-medium">
                            Photo
                        </label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('avatar', e.target.files?.[0] || null)}
                            className="border-border/40"
                        />
                        <InputError message={errors.avatar} />
                    </div>

                    <Button type="submit" size="sm" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
