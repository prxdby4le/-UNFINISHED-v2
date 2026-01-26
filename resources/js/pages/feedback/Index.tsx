import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type Feedback } from '@/repositories/feedbackRepository';
import EmptyState from '@/components/EmptyState';
import { Send, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface Props {
    audioVersionId: number;
    feedback: Feedback[];
    count: number;
    currentUserId?: number;
}

export default function FeedbackIndex({ audioVersionId, feedback, count, currentUserId }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        timestamp_seconds: undefined as number | undefined,
    });

    const editForm = useForm({
        content: '',
        timestamp_seconds: undefined as number | undefined,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/audio-versions/${audioVersionId}/feedback`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleEdit = (item: Feedback) => {
        setEditingId(item.id);
        editForm.setData({
            content: item.content,
            timestamp_seconds: item.timestamp_seconds || undefined,
        });
    };

    const handleUpdate = (id: number) => {
        editForm.post(`/feedback/${id}`, {
            _method: 'PUT',
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja deletar este comentário?')) {
            router.delete(`/feedback/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const formatTimestamp = (seconds?: number): string => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'agora';
        if (minutes < 60) return `há ${minutes} minutos`;
        if (hours < 24) return `há ${hours} horas`;
        if (days < 7) return `há ${days} dias`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <AppLayout>
            <Head title="Comentários" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Comentários</h1>
                    <p className="text-muted-foreground">{count} comentário{count !== 1 ? 's' : ''}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Comentário</CardTitle>
                        <CardDescription>Deixe seu feedback sobre esta versão</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium mb-1">
                                    Comentário *
                                </label>
                                <textarea
                                    id="content"
                                    value={data.content || ''}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    required
                                    minLength={3}
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div>
                                <label htmlFor="timestamp" className="block text-sm font-medium mb-1">
                                    Timestamp (opcional) - em segundos
                                </label>
                                <Input
                                    id="timestamp"
                                    type="number"
                                    min="0"
                                    value={data.timestamp_seconds || ''}
                                    onChange={(e) =>
                                        setData(
                                            'timestamp_seconds',
                                            e.target.value ? parseInt(e.target.value) : undefined
                                        )
                                    }
                                    placeholder="Ex: 90 (para 1:30)"
                                />
                                <InputError message={errors.timestamp_seconds} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                <Send className="size-4" />
                                {processing ? 'Enviando...' : 'Enviar Comentário'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {feedback.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="Nenhum comentário ainda"
                        description="Seja o primeiro a deixar um comentário sobre esta versão"
                    />
                ) : (
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-4">
                                    {editingId === item.id ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Comentário
                                                </label>
                                                <textarea
                                                    value={editForm.data.content || ''}
                                                    onChange={(e) => editForm.setData('content', e.target.value)}
                                                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Timestamp (segundos)
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={editForm.data.timestamp_seconds || ''}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'timestamp_seconds',
                                                            e.target.value ? parseInt(e.target.value) : undefined
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdate(item.id)}
                                                    disabled={editForm.processing}
                                                >
                                                    Salvar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            {item.user?.profile?.full_name?.[0] ||
                                                                item.user?.name?.[0] ||
                                                                'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.user?.profile?.full_name || item.user?.name || 'Usuário'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDate(item.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm">{item.content}</p>
                                                    {item.timestamp_seconds !== null && (
                                                        <button
                                                            onClick={() => {
                                                                // TODO: Implement jump to timestamp in player
                                                            }}
                                                            className="mt-2 text-sm text-primary hover:underline"
                                                        >
                                                            {formatTimestamp(item.timestamp_seconds)}
                                                        </button>
                                                    )}
                                                </div>
                                                {item.user_id === currentUserId && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
